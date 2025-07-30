/**
 * Main configuration-driven parser for Ash DSL blocks.
 *
 * This file contains:
 * - ModuleParser: The core parser implementation using configuration-driven logic.
 * - All parsing logic, configuration management, and helpers for Ash DSL parsing.
 *
 * Usage: Use the exported singleton `moduleParser` for all parsing tasks.
 */

import {
  Parser,
  ParseResult,
  ParsedSection,
  ParsedDetail,
  CodeLensEntry,
} from "./parser";
import { ModuleInterface, DslBlock } from "./moduleInterface";
import AshAdmin_Domain_Config from "./configurations/AshAdmin.Domain.config";
import AshAdmin_Resource_Config from "./configurations/AshAdmin.Resource.config";
import AshAuthentication_Config from "./configurations/AshAuthentication.config";
import Ash_Domain_Config from "./configurations/Ash.Domain.config";
import Ash_PubSub_Config from "./configurations/Ash.PubSub.config";
import Ash_Resource_Config from "./configurations/Ash.Resource.config";
import AshPaperTrail_Config from "./configurations/AshPaperTrail.config";
import AshPostgres_Config from "./configurations/AshPostgres.config";

/**
 * Returns all available ModuleInterface configurations.
 * Add new configurations here as they are created.
 */
export function getAllAvailableConfigurations(): ModuleInterface[] {
  return [
    AshAdmin_Domain_Config,
    AshAdmin_Resource_Config,
    AshAuthentication_Config,
    Ash_Domain_Config,
    Ash_PubSub_Config,
    Ash_Resource_Config,
    AshPaperTrail_Config,
    AshPostgres_Config,
    // Add new configurations here as they are created
  ];
}

/**
 * A Parser implementation that uses ModuleInterface configurations
 * to parse Ash DSL blocks in a structured way.
 */
export class ModuleParser implements Parser {
  private static instance: ModuleParser;
  private constructor() {}

  static getInstance(): ModuleParser {
    if (!ModuleParser.instance) {
      ModuleParser.instance = new ModuleParser();
    }
    return ModuleParser.instance;
  }

  parse(source: string): ParseResult {
    const availableConfigs = getAllAvailableConfigurations();
    // Pass 1: Find all use declarations
    const useDeclarations = findUseDeclarations(source);
    if (useDeclarations.length === 0) {
      return {
        sections: [],
        isAshFile: false,
        parserName: "ModuleParser",
        codeLenses: [],
      };
    }
    // Identify which modules are present
    const matchedModules = identifyConfiguredModules(
      useDeclarations,
      availableConfigs
    );
    if (matchedModules.length === 0) {
      return {
        sections: [],
        isAshFile: false,
        parserName: "ModuleParser",
        codeLenses: [],
      };
    }
    // Extract DSL modules and their blocks
    const sections = extractModules(source, matchedModules);
    // Extract code lenses for documentation
    const codeLenses = extractCodeLenses(source, matchedModules);
    return {
      sections,
      isAshFile: true,
      parserName: "ModuleParser",
      codeLenses,
    };
  }
}

export const moduleParser = ModuleParser.getInstance();

/**
 * Extract code lenses from matched modules and parsed sections.
 * These will be shown in the editor as clickable links to documentation.
 */
// For testing only
export function extractCodeLenses(
  source: string,
  matchedModules: ModuleInterface[]
): CodeLensEntry[] {
  const codeLenses: CodeLensEntry[] = [];
  const lines = source.split("\n");

  // For each matched module, search for its code lens keywords throughout the entire source
  for (const module of matchedModules) {
    if (!module.codeLenses) {
      continue;
    }

    // Search for each keyword in the entire source code
    for (const [keyword, url] of Object.entries(module.codeLenses)) {
      let searchPos = 0;
      let foundPos: number;

      // Find all occurrences of this keyword
      while ((foundPos = source.indexOf(keyword, searchPos)) !== -1) {
        // Make sure it's a whole word by checking boundaries
        const prevChar = foundPos > 0 ? source.charAt(foundPos - 1) : " ";
        const nextChar =
          foundPos + keyword.length < source.length
            ? source.charAt(foundPos + keyword.length)
            : " ";

        const isWholeWord =
          !/[a-zA-Z0-9_]/.test(prevChar) && !/[a-zA-Z0-9_]/.test(nextChar);

        if (isWholeWord) {
          // Convert position to line and character
          let line = 1;
          let currentPos = 0;

          while (currentPos < foundPos && line - 1 < lines.length) {
            currentPos += lines[line - 1].length + 1; // +1 for the newline
            if (currentPos <= foundPos) {
              line++;
            }
          }

          // Calculate the character position within the line
          const lineStart = currentPos - lines[line - 1].length - 1;
          const character = foundPos - lineStart;

          // Add the code lens
          codeLenses.push({
            line,
            character,
            title: `📘 ${module.displayName} Docs`,
            target: url,
            source: module.displayName,
            range: { startLine: line, endLine: line },
          });
        }

        searchPos = foundPos + keyword.length;
      }
    }
  }

  return codeLenses;
}

/**
 * Extract DSL modules and their blocks from source code
 * Uses a context-driven approach where all imported modules contribute to parsing
 */
export function extractModules(
  source: string,
  matchedModules: ModuleInterface[]
): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = source.split("\n");

  // Process each matched module to find DSL blocks

  // Process line by line to find DSL blocks
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    // For each top-level DSL block in each module
    for (const module of matchedModules) {
      for (const dslBlock of module.dslBlocks) {
        // Create regex pattern to match this block declaration
        // The pattern looks for blockName followed by optional content and then "do"
        const blockPattern = new RegExp(
          `^\\s*(${dslBlock.blockName})\\s*(?:(.+?)\\s+)?do\\s*$`
        );

        const match = line.match(blockPattern);
        if (match) {
          // Found a top-level block, now find where it ends
          const blockStart = source.indexOf(line, 0);
          if (blockStart === -1) continue;

          // Find the end position of this do/end block
          const blockEnd = findEndOfBlock(source, blockStart);
          if (blockEnd === -1) continue;

          // Extract block content (everything between do and end)
          const fullBlockText = source.substring(blockStart, blockEnd);
          const blockContentStart = fullBlockText.indexOf("do") + 2;
          let blockContent = fullBlockText
            .substring(blockContentStart, fullBlockText.length - 3) // -3 for "end"
            .trim();

          // Extract the name if this block has a name pattern
          // We're not using the name directly anymore, but we'll store it in a comment for debugging
          // We previously stored this in the 'name' property but that's not in the interface
          let blockName = "";
          if (dslBlock.namePattern) {
            const nameMatch = match[2].match(new RegExp(dslBlock.namePattern));
            if (nameMatch && nameMatch[1]) {
              blockName = nameMatch[1].trim();
              // Add the name info to rawContent for reference
              blockContent = `name: ${blockName}\n${blockContent}`;
            }
          }

          // Parse child blocks using the children of this specific DSL block
          const details = parseChildBlocks(
            blockContent,
            dslBlock.children || [],
            matchedModules,
            lineIndex + 1
          );

          // Create the parsed section
          const section: ParsedSection = {
            section: dslBlock.blockName,
            // Store the name in the rawContent if it exists
            rawContent: blockContent,
            startLine: lineIndex + 1,
            endLine: lineIndex + 1 + fullBlockText.split("\n").length - 1,
            details,
          };

          sections.push(section);

          // Skip lines that were already processed as part of this block
          lineIndex += fullBlockText.split("\n").length - 1;
          break;
        }
      }
    }
  }

  return sections;
}

/**
 * Recursively parse child blocks using a combined configuration from all modules.
 */
function parseChildBlocks(
  parentContent: string,
  childConfigs: DslBlock[],
  allModules: ModuleInterface[],
  parentStartLine: number
): ParsedDetail[] {
  if (!parentContent.trim()) {
    return [];
  }

  const details: ParsedDetail[] = [];
  const lines = parentContent.split("\n");

  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check this line against each child block configuration
    for (const childConfig of childConfigs) {
      // Simple block pattern (e.g., "attribute :name, :string")
      // The pattern matches the block name followed by any content
      const blockPattern = new RegExp(
        `^\\s*(${childConfig.blockName})\\s+(.+?)\\s*$`
      );
      const match = line.match(blockPattern);

      if (match) {
        // Check if this is a nested do/end block
        const isDoBlock = line.trim().endsWith(" do");

        if (isDoBlock) {
          // This is a nested do/end block
          const nestedBlockStart = parentContent.indexOf(line);
          if (nestedBlockStart === -1) continue;

          // Find where the nested block ends
          const nestedBlockEnd = findEndOfBlock(
            parentContent,
            nestedBlockStart
          );

          if (nestedBlockEnd === -1) continue;

          // Extract the nested block content
          const fullNestedBlock = parentContent.substring(
            nestedBlockStart,
            nestedBlockEnd
          );

          const nestedBlockContentStart = fullNestedBlock.indexOf("do") + 2;
          const nestedBlockContent = fullNestedBlock
            .substring(nestedBlockContentStart, fullNestedBlock.length - 3) // -3 for "end"
            .trim();

          // Extract the name if this block has a name pattern
          let name = "";
          const contentBeforeDo = line
            .substring(0, line.lastIndexOf(" do"))
            .trim();
          const blockNameLength = childConfig.blockName.length;
          const nameText = contentBeforeDo.substring(blockNameLength).trim();

          if (childConfig.namePattern) {
            const nameMatch = nameText.match(
              new RegExp(childConfig.namePattern)
            );
            if (nameMatch && nameMatch[1]) {
              name = nameMatch[1].trim();
            }
          }

          // Process children recursively if this block has child configurations
          let nestedDetails: ParsedDetail[] = [];
          if (childConfig.children && childConfig.children.length > 0) {
            nestedDetails = parseChildBlocks(
              nestedBlockContent,
              childConfig.children,
              allModules,
              parentStartLine + i + 1
            );
          }

          // Create the parsed detail for this nested block
          const detail: ParsedDetail = {
            section: parentContent,
            detail: childConfig.blockName,
            name,
            rawContent: nameText,
            line: parentStartLine + i,
            column: 1,
            endLine:
              parentStartLine + i + fullNestedBlock.split("\n").length - 1,
            childDetails: nestedDetails,
          };

          details.push(detail);

          // Skip the lines we've processed
          const linesInBlock = fullNestedBlock.split("\n").length - 1;
          i += linesInBlock;
          break;
        } else {
          // This is a simple one-line block
          let name = "";
          const content = match[2].trim();

          if (childConfig.namePattern) {
            const nameMatch = content.match(
              new RegExp(childConfig.namePattern)
            );
            if (nameMatch && nameMatch[1]) {
              name = nameMatch[1].trim();
            }
          }

          // Create the parsed detail for this simple block
          const detail: ParsedDetail = {
            section: parentContent,
            detail: childConfig.blockName,
            name,
            rawContent: content,
            line: parentStartLine + i,
            column: 1,
            endLine: parentStartLine + i,
            childDetails: [], // Simple blocks don't have children
          };

          details.push(detail);
          break;
        }
      }
    }
  }

  return details;
}

/**
 * Find end position of a do/end block
 * This function is only used for finding the end of do/end blocks
 */
function findEndOfBlock(source: string, startPos: number): number {
  // Find the 'do' keyword at or after startPos
  const blockStart = source.indexOf("do", startPos);
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
  let stringDelimiter = "";
  let escaped = false;

  while (nestLevel > 0 && pos < source.length) {
    const char = source.charAt(pos);

    // Handle string literals
    if ((char === '"' || char === "'" || char === "`") && !escaped) {
      if (!inString) {
        inString = true;
        stringDelimiter = char;
      } else if (char === stringDelimiter) {
        inString = false;
      }
    }

    // Track escape characters in strings
    escaped = char === "\\" && !escaped;

    // Only look for keywords when not in a string
    if (!inString) {
      // Check for 'end' keyword
      if (
        pos + 3 <= source.length &&
        source.substring(pos, pos + 3) === "end" &&
        (pos === 0 || /\s/.test(source.charAt(pos - 1))) &&
        (pos + 3 === source.length || /[\s;.]/.test(source.charAt(pos + 3)))
      ) {
        nestLevel--;
        // If found the matching end, return position after 'end'
        if (nestLevel === 0) {
          return pos + 3;
        }
      }
      // Check for nested 'do' keyword
      else if (
        pos + 2 <= source.length &&
        source.substring(pos, pos + 2) === "do" &&
        (pos === 0 || /\s/.test(source.charAt(pos - 1))) &&
        (pos + 2 === source.length || /[\s\n]/.test(source.charAt(pos + 2)))
      ) {
        // Verify it's not 'do:' syntax
        if (
          !(
            pos + 3 < source.length &&
            source.charAt(pos + 2) === " " &&
            source.charAt(pos + 3) === ":"
          )
        ) {
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
 * Handles comma-continuation and bracket-continuation properly.
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
      const bracketStack: string[] = [];

      // Track bracket nesting to know when the use declaration is complete
      const updateBracketStack = (text: string) => {
        for (const char of text) {
          if (char === "[" || char === "(" || char === "{") {
            bracketStack.push(char);
          } else if (char === "]" || char === ")" || char === "}") {
            bracketStack.pop();
          }
        }
      };

      // Initialize bracket stack with the first line
      updateBracketStack(line);

      // Continue collecting lines while:
      // 1. The current line ends with a comma, OR
      // 2. We have open brackets/parentheses that need to be closed
      while (
        currentLineIndex < lines.length &&
        (useBlock.trim().endsWith(",") || bracketStack.length > 0)
      ) {
        currentLineIndex++;
        if (currentLineIndex < lines.length) {
          const nextLine = lines[currentLineIndex];
          useBlock += "\n" + nextLine;
          updateBracketStack(nextLine);

          // If we've closed all brackets and the line doesn't end with comma, we're done
          if (bracketStack.length === 0 && !nextLine.trim().endsWith(",")) {
            break;
          }
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
