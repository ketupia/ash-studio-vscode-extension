import { ModuleInterface } from "./moduleInterface";
import AshResourceConfig from "./AshResource.config";
import AshPostgresConfig from "./AshPostgres.config";
import AshPaperTrailConfig from "./AshPaperTrail.config";

/**
 * Returns all available ModuleInterface configurations.
 * Add new configurations here as they are created.
 */
export function getAllAvailableConfigurations(): ModuleInterface[] {
  return [
    AshResourceConfig,
    AshPostgresConfig,
    AshPaperTrailConfig,
    // Add new configurations here as they are created
    // AshGraphqlConfig,
    // AshJsonApiConfig,
    // etc.
  ];
}

export interface ParsedDetail {
  section: string;
  detail: string;
  name?: string;
  doBlock: "required" | "prohibited" | "optional";
  blockFound: boolean;
  /** Line number where this detail starts (1-based) */
  line: number;
  /** Column where this detail starts (1-based) */
  column: number;
  /** Line number where this detail ends (1-based) */
  endLine: number;
}

export interface ParsedSection {
  section: string;
  details: ParsedDetail[];
  /** Line number where this section starts (1-based) */
  startLine: number;
  /** Line number where this section ends (1-based) */
  endLine: number;
}

/**
 * Parses a DSL source string using a ModuleInterface config.
 * Returns found sections and details with names and block info.
 */
export function parseModuleDSL(
  source: string,
  config: ModuleInterface
): ParsedSection[] {
  const results: ParsedSection[] = [];
  for (const section of config.dslBlocks) {
    // Improved regex: match blockName followed by optional spaces and 'do' keyword
    const sectionRegex = new RegExp(`^\\s*${section.blockName}\\s+do\\b`, "gm");
    const sectionMatches = [...source.matchAll(sectionRegex)];
    if (sectionMatches.length === 0) continue;
    for (const match of sectionMatches) {
      const sectionStart = match.index ?? 0;
      // For demo, just use the whole source after section start
      const sectionSource = source.slice(sectionStart);
      const details: ParsedDetail[] = [];
      if (section.children) {
        for (const detail of section.children) {
          const detailRegex = detail.namePattern
            ? new RegExp(detail.namePattern, "gm")
            : null;
          if (detailRegex) {
            for (const dMatch of sectionSource.matchAll(detailRegex)) {
              details.push({
                section: section.blockName,
                detail: detail.blockName,
                name: dMatch[1],
                doBlock: detail.doBlock,
                blockFound: false, // Block detection can be added
                line: 0, // Line number detection can be added
                column: 0, // Column detection can be added
                endLine: 0, // End line number detection can be added
              });
            }
          } else {
            // No namePattern: just record the detail type
            details.push({
              section: section.blockName,
              detail: detail.blockName,
              doBlock: detail.doBlock,
              blockFound: false,
              line: 0,
              column: 0,
              endLine: 0,
            });
          }
        }
      }
      results.push({
        section: section.blockName,
        details,
        startLine: 0, // Section start line detection can be added
        endLine: 0, // Section end line detection can be added
      });
    }
  }
  return results;
}

/**
 * Finds all 'use' declarations in the source file.
 * Returns an array of raw use declaration blocks (may be multiline).
 * Handles comma-continuation properly: lines ending with comma continue to next line.
 */
export function findUseDeclarations(source: string): string[] {
  const lines = source.split("\n");
  const useDeclarations: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a use declaration
    const useMatch = line.match(/^\s*use\s+([A-Za-z0-9_.]+)/);
    if (useMatch) {
      let useBlock = line;
      let currentLineIndex = i;

      // Continue collecting lines while the current line ends with a comma
      while (currentLineIndex < lines.length && useBlock.trim().endsWith(",")) {
        currentLineIndex++;
        if (currentLineIndex < lines.length) {
          useBlock += "\n" + lines[currentLineIndex];
        }
      }

      useDeclarations.push(useBlock.trim());

      // Skip the lines we've already processed
      i = currentLineIndex;
    }
  }

  return useDeclarations;
}

/**
 * Identifies which ModuleInterface configurations are present in the given use declarations.
 * Takes raw use declaration strings and matches them against available configs.
 */
export function identifyConfiguredModules(
  useDeclarations: string[],
  availableConfigs: ModuleInterface[]
): ModuleInterface[] {
  const matchedConfigs: ModuleInterface[] = [];

  for (const useDeclaration of useDeclarations) {
    for (const config of availableConfigs) {
      // Check if this use declaration contains the module pattern
      if (useDeclaration.includes(config.declarationPattern)) {
        // Avoid duplicates
        if (
          !matchedConfigs.find(
            c => c.declarationPattern === config.declarationPattern
          )
        ) {
          matchedConfigs.push(config);
        }
      }
    }
  }

  return matchedConfigs;
}

/**
 * Main activation flow for Elixir files (two-pass system):
 * 1. Find all use declarations in the file.
 * 2. Identify which ModuleInterface configs match the found use declarations.
 * 3. For each matched config, parse the DSL blocks according to the configuration.
 */
export function analyzeElixirFile(
  source: string,
  allConfigs?: ModuleInterface[]
): {
  matchedModules: ModuleInterface[];
  parsedSections: ParsedSection[];
} {
  // Use provided configs or get all available configurations
  const availableConfigs = allConfigs || getAllAvailableConfigurations();

  // Pass 1: Find all use declarations
  const useDeclarations = findUseDeclarations(source);
  if (useDeclarations.length === 0) {
    return { matchedModules: [], parsedSections: [] };
  }

  // Pass 2: Identify which configurations match the found use declarations
  const matchedModules = identifyConfiguredModules(
    useDeclarations,
    availableConfigs
  );

  // Pass 3: Parse DSL blocks for each matched module configuration
  let parsedSections: ParsedSection[] = [];
  for (const moduleConfig of matchedModules) {
    const sections = parseModuleDSL(source, moduleConfig);
    parsedSections = parsedSections.concat(sections);
  }

  return { matchedModules, parsedSections };
}
