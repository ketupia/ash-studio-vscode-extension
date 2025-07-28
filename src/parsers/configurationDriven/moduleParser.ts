import { Parser, ParseResult, ParsedSection, ParsedDetail, ParseError, CodeLensEntry } from "../parser";
import { ModuleInterface, DslBlock } from "./moduleInterface";
import AshAuthenticationConfig from "./configurations/AshAuthentication.config";
import AshPaperTrailConfig from "./configurations/AshPaperTrail.config";
import AshPostgresConfig from "./configurations/AshPostgres.config";
import AshPubSubConfig from "./configurations/AshPubSub.config";
import AshResourceConfig from "./configurations/AshResource.config";

/**
 * Returns all available ModuleInterface configurations.
 * Add new configurations here as they are created.
 */
export function getAllAvailableConfigurations(): ModuleInterface[] {
  return [
    AshAuthenticationConfig,
    AshPaperTrailConfig,
    AshPostgresConfig,
    AshPubSubConfig,
    AshResourceConfig,
    // Add new configurations here as they are created
    // AshGraphqlConfig,
    // AshJsonApiConfig,
    // etc.
  ];
}

/**
 * A Parser implementation that uses ModuleInterface configurations
 * to parse Ash DSL blocks in a structured way.
 */
// Export functions for testing purposes
export const findEndOfBlockForTesting = findEndOfBlock;
export const extractModulesForTesting = extractModules;

export class ModuleParser implements Parser {
  private static instance: ModuleParser;

  static getInstance(): ModuleParser {
    if (!ModuleParser.instance) {
      ModuleParser.instance = new ModuleParser();
    }
    return ModuleParser.instance;
  }

  /**
   * Parse Ash DSL content using configuration-driven approach
   * Uses a line-by-line scanning approach for better performance
   */
  parse(source: string): ParseResult {
    // Use all available configurations
    const availableConfigs = getAllAvailableConfigurations();

    // Pass 1: Find all use declarations
    const useDeclarations = findUseDeclarations(source);
    if (useDeclarations.length === 0) {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
        parserName: "ModuleParser",
        codeLenses: [],
      };
    }

    // Pass 2: Identify which configurations match the found use declarations
    const matchedModules = identifyConfiguredModules(
      useDeclarations,
      availableConfigs
    );
    
    if (matchedModules.length === 0) {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
        parserName: "ModuleParser",
        codeLenses: [],
      };
    }

    // Pass 3: Use line-by-line parsing to find DSL blocks
    const sections: ParsedSection[] = [];
    const errors: ParseError[] = [];
    const codeLenses: CodeLensEntry[] = [];
    
    try {
      const parsedSections = extractModules(source, matchedModules);
      sections.push(...parsedSections);
      
      // Pass 4: Extract code lenses from modules
      const extractedLenses = extractCodeLenses(source, matchedModules);
      codeLenses.push(...extractedLenses);
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : String(error),
        line: 1,
        column: 1,
        offset: 0,
      });
    }

    return {
      sections,
      errors,
      isAshFile: true,
      parserName: "ModuleParser",
      codeLenses,
    };
  }
}

// Create a singleton instance for easy access
export const moduleParser = ModuleParser.getInstance();

/**
 * Extract code lenses from matched modules and parsed sections.
 * These will be shown in the editor as clickable links to documentation.
 */
function extractCodeLenses(
  source: string,
  matchedModules: ModuleInterface[]
): CodeLensEntry[] {
  const codeLenses: CodeLensEntry[] = [];
  const lines = source.split('\n');
  
  // For each matched module, search for its code lens keywords throughout the entire source
  for (const module of matchedModules) {
    if (!module.codeLenses) {
      continue;
    }
    
    // Search for each keyword in the entire source code
    for (const [keyword, url] of Object.entries(module.codeLenses)) {
      
      // Search through all lines for this keyword (allow multiple matches)
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Find ALL occurrences of the keyword in this line
        let searchIndex = 0;
        while (searchIndex < line.length) {
          const keywordIndex = line.indexOf(keyword, searchIndex);
          
          if (keywordIndex === -1) {
            break; // No more occurrences in this line
          }
          
          // Make sure it's a standalone word (not part of another word)
          const beforeChar = keywordIndex > 0 ? line[keywordIndex - 1] : ' ';
          const afterChar = keywordIndex + keyword.length < line.length ? line[keywordIndex + keyword.length] : ' ';
          
          // Check if it's a word boundary (space, tab, or word boundary characters)
          if (/\s/.test(beforeChar) && (/\s|do/.test(afterChar) || afterChar === ':')) {
            const codeLens = {
              line: lineIndex + 1, // Convert to 1-based line number
              character: keywordIndex,
              title: `📖 ${keyword} docs`,
              target: url as string,
              source: module.displayName,
              range: {
                startLine: lineIndex + 1,
                endLine: lineIndex + 1
              }
            };
            
            codeLenses.push(codeLens);
          }
          
          // Move search index past this occurrence
          searchIndex = keywordIndex + keyword.length;
        }
      }

    }
  }

  
  return codeLenses;
}

// The processBlockDetails function is not used in the current implementation
// Keeping this stub to document the approach for potential future use
/**
 * Recursively process block details to find code lens opportunities in nested blocks
 */
/* Commented out to fix lint warnings
function processBlockDetails(
  details: ParsedDetail[],
  codeLenses: CodeLensEntry[],
  lines: string[],
  moduleName: string,
  availableModules: ModuleInterface[] = []
): void {
  for (const detail of details) {
    // Check if this block has specific code lenses defined
    // Note: We're currently not storing block configuration in the ParsedDetail
    // We would need to enhance ParsedDetail to include the block configuration
    // For now, we'll check if the detail name matches a keyword in the module's codeLenses
    
    const moduleDef = availableModules.find((m: ModuleInterface) => m.displayName === moduleName);
    if (moduleDef?.codeLenses) {
      const startLine = detail.line - 1; // Use line instead of startLine
      const line = lines[startLine] || '';
      
      for (const [keyword, url] of Object.entries(moduleDef.codeLenses)) {
        if (line.includes(keyword)) {
          const keywordIndex = line.indexOf(keyword);
          
          codeLenses.push({
            line: startLine + 1, // Convert to 1-based line number
            character: keywordIndex,
            title: `Documentation for ${keyword}`,
            target: url as string,
            source: `${moduleName} - ${detail.detail}`,
            range: {
              startLine: startLine + 1,
              endLine: detail.endLine
            }
          });
        }
      }
    }
    
    // Recursively process child blocks
    if (detail.childDetails && detail.childDetails.length > 0) {
      processBlockDetails(detail.childDetails, codeLenses, lines, moduleName, availableModules);
    }
  }
}

/**
 * Extract DSL modules and their blocks from source code
 * Uses a context-driven approach where all imported modules contribute to parsing
 */
function extractModules(source: string, matchedModules: ModuleInterface[]): ParsedSection[] {
  const lines = source.split('\n');
  const sections: ParsedSection[] = [];
  const processedLines = new Set<number>(); // Track which lines we've already processed
  
  // Create a combined configuration from all matched modules
  // This allows multiple modules to contribute DSL blocks with the same name
  const combinedDslBlocks = new Map<string, DslBlock[]>();
  
  for (const module of matchedModules) {
    for (const dslBlock of module.dslBlocks) {
      if (!combinedDslBlocks.has(dslBlock.blockName)) {
        combinedDslBlocks.set(dslBlock.blockName, []);
      }
      combinedDslBlocks.get(dslBlock.blockName)!.push(dslBlock);
    }
  }
  
  // Scan through lines looking for DSL block declarations
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    // Skip lines we've already processed as part of a block
    if (processedLines.has(lineIndex)) {
      continue;
    }
    
    const line = lines[lineIndex];
    const trimmedLine = line.trim();
    
    // Look for DSL block patterns (e.g., "attributes do", "actions do")
    const blockMatch = trimmedLine.match(/^(\w+)\s+do\b/);
    if (blockMatch) {
      const blockName = blockMatch[1];
      
      // Check if any of our combined configurations define this DSL block
      const dslBlockConfigs = combinedDslBlocks.get(blockName);
      
      if (dslBlockConfigs && dslBlockConfigs.length > 0) {
        // Found a top-level DSL block
        const startLine = lineIndex + 1; // 1-based line numbers
        const startPos = source.indexOf(line) + line.indexOf(blockMatch[0]);
        
        // Find the end of this block
        const endPos = findEndOfBlock(source, startPos);
        const endLine = source.substring(0, endPos).split('\n').length;
        const rawContent = source.substring(startPos, endPos);
        
        // Mark all lines in this block as processed
        for (let i = lineIndex; i < endLine; i++) {
          processedLines.add(i);
        }
        
        // Parse child blocks using all available configurations for this block
        const details = parseChildBlocksWithCombinedConfigs(rawContent, dslBlockConfigs, matchedModules, startLine);
        
        sections.push({
          section: blockName,
          details,
          startLine,
          endLine,
          rawContent,
        });
        
        // Skip to the end of this block
        lineIndex = endLine - 1;
      }
    }
  }
  
  return sections;
}

/**
 * Parse child blocks using combined configurations from all imported modules
 * This allows multiple modules to contribute child block definitions
 */
function parseChildBlocksWithCombinedConfigs(
  parentContent: string,
  dslBlockConfigs: DslBlock[],
  allModules: ModuleInterface[],
  parentStartLine: number
): ParsedDetail[] {
  // Combine all child block definitions from all configurations
  const combinedChildren = new Map<string, DslBlock>();
  
  for (const config of dslBlockConfigs) {
    if (config.children) {
      for (const child of config.children) {
        // Use the most recent definition if there are conflicts
        combinedChildren.set(child.blockName, child);
      }
    }
  }
  
  return parseChildBlocksFromCombinedConfig(
    parentContent,
    Array.from(combinedChildren.values()),
    allModules,
    parentStartLine
  );
}

// The parseChildBlocksForModule function has been removed in favor of
// parseChildBlocksWithCombinedConfigs which supports multiple modules

/**
 * Parse child blocks using a combined configuration approach
 */
function parseChildBlocksFromCombinedConfig(
  parentContent: string,
  childConfigs: DslBlock[],
  allModules: ModuleInterface[],
  parentStartLine: number
): ParsedDetail[] {
  const details: ParsedDetail[] = [];
  const lines = parentContent.split('\n');
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // Look for child block patterns
    for (const childConfig of childConfigs) {
      const blockName = childConfig.blockName;
      
      // Check for named blocks (e.g., "attribute :name")
      if (childConfig.namePattern) {
        const namedPattern = new RegExp(`^${blockName}\\s+${childConfig.namePattern}`);
        const namedMatch = trimmedLine.match(namedPattern);
        if (namedMatch) {
          const name = namedMatch[1] || namedMatch[0].split(/\s+/)[1];
          
          details.push({
            section: blockName,
            detail: `${blockName} ${name}`,
            line: parentStartLine + lineIndex,
            column: 1,
            endLine: parentStartLine + lineIndex,
            childDetails: [],
          });
          continue;
        }
      }
      
      // Check for block-style declarations (e.g., "validate do")
      const blockPattern = new RegExp(`^${blockName}\\s+do\\b`);
      const blockMatch = trimmedLine.match(blockPattern);
      if (blockMatch) {
        // Find the end of this nested block
        const blockStartPos = parentContent.indexOf(line) + line.indexOf(blockMatch[0]);
        const blockEndPos = findEndOfBlock(parentContent, blockStartPos);
        const blockEndLine = parentContent.substring(0, blockEndPos).split('\n').length;
        
        details.push({
          section: blockName,
          detail: blockName,
          line: parentStartLine + lineIndex,
          column: 1,
          endLine: parentStartLine + blockEndLine - 1,
          childDetails: [],
        });
        
        // Skip lines within this nested block
        lineIndex = blockEndLine - 1;
        continue;
      }
      
      // Check for simple declarations (e.g., "primary_key :id")
      if (trimmedLine.startsWith(blockName + ' ')) {
        const parts = trimmedLine.split(/\s+/);
        const detail = parts.length > 1 ? `${blockName} ${parts.slice(1).join(' ')}` : blockName;
        
        details.push({
          section: blockName,
          detail,
          line: parentStartLine + lineIndex,
          column: 1,
          endLine: parentStartLine + lineIndex,
          childDetails: [],
        });
        continue;
      }
    }
  }
  
  return details;
}

/**
 * Consume a do: block that continues until lines stop ending with commas
 */
function consumeDoColonBlock(lines: string[], startIndex: number): string {
  let content = lines[startIndex];
  let currentIndex = startIndex;
  
  // Continue while lines end with comma
  while (currentIndex < lines.length - 1 && content.trim().endsWith(',')) {
    currentIndex++;
    content += '\n' + lines[currentIndex];
  }
  
  return content;
}

/**
 * Consume a multi-line block (like function calls with parentheses)
 * Continues until balanced parentheses or no trailing comma
 */
function consumeMultiLineBlock(lines: string[], startIndex: number): string {
  let content = lines[startIndex];
  let currentIndex = startIndex;
  let parenCount = 0;
  let inString = false;
  let stringDelimiter = '';
  
  // Count parentheses in the first line
  for (const char of content) {
    if ((char === '"' || char === "'" || char === '`') && !inString) {
      inString = true;
      stringDelimiter = char;
    } else if (char === stringDelimiter && inString) {
      inString = false;
    } else if (!inString) {
      if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
    }
  }
  
  // If we have unbalanced parentheses or trailing comma, continue
  while (currentIndex < lines.length - 1 && 
         (parenCount > 0 || content.trim().endsWith(','))) {
    currentIndex++;
    const nextLine = lines[currentIndex];
    content += '\n' + nextLine;
    
    // Update parentheses count for the new line
    inString = false;
    for (const char of nextLine) {
      if ((char === '"' || char === "'" || char === '`') && !inString) {
        inString = true;
        stringDelimiter = char;
      } else if (char === stringDelimiter && inString) {
        inString = false;
      } else if (!inString) {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
      }
    }
  }
  
  return content;
}

/**
 * Find end position of a do/end block
 * This function is only used for finding the end of do/end blocks
 */
function findEndOfBlock(source: string, startPos: number): number {
  // Find the 'do' keyword at or after startPos
  const blockStart = source.indexOf('do', startPos);
  if (blockStart === -1) return source.length; // Not found
  
  // Skip past the 'do' keyword
  let pos = blockStart + 2;
  
  // Skip whitespace after 'do'
  while (pos < source.length && /\s/.test(source.charAt(pos))) {
    pos++;
  }
  
  // Find the matching 'end' with proper nesting
  let nestLevel = 1;
  
  // Track string literals to avoid matching keywords inside strings
  let inString = false;
  let stringDelimiter = '';
  let escaped = false;
  
  while (nestLevel > 0 && pos < source.length) {
    const char = source.charAt(pos);
    
    // Handle string literals
    if ((char === '"' || char === "'" || char === '`') && !escaped) {
      if (!inString) {
        inString = true;
        stringDelimiter = char;
      } else if (char === stringDelimiter) {
        inString = false;
      }
    }
    
    // Track escape characters in strings
    escaped = char === '\\' && !escaped;
    
    // Only look for keywords when not in a string
    if (!inString) {
      // Check for 'end' keyword
      if (pos + 3 <= source.length && 
          source.substring(pos, pos + 3) === 'end' &&
          (pos === 0 || /\s/.test(source.charAt(pos - 1))) &&
          (pos + 3 === source.length || /[\s;.]/.test(source.charAt(pos + 3)))) {
        nestLevel--;
        // If found the matching end, return position after 'end'
        if (nestLevel === 0) {
          return pos + 3;
        }
      } 
      // Check for nested 'do' keyword
      else if (pos + 2 <= source.length && 
               source.substring(pos, pos + 2) === 'do' &&
               (pos === 0 || /\s/.test(source.charAt(pos - 1))) &&
               (pos + 2 === source.length || /[\s\n]/.test(source.charAt(pos + 2)))) {
        // Verify it's not 'do:' syntax
        if (!(pos + 3 < source.length && source.charAt(pos + 2) === ' ' && source.charAt(pos + 3) === ':')) {
          nestLevel++;
        }
      }
    }
    
    pos++;
  }
  
  return pos;
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
