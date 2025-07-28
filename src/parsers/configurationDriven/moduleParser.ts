import { Parser, ParseResult, ParsedSection, ParsedDetail, ParseError, CodeLensEntry } from "../parser";
import { ModuleInterface, DslBlock } from "./moduleInterface";
import AshResourceConfig from "./configurations/AshResource.config";
import AshPostgresConfig from "./configurations/AshPostgres.config";
import AshPaperTrailConfig from "./configurations/AshPaperTrail.config";
import AshAuthenticationConfig from "./configurations/AshAuthentication.config";

/**
 * Returns all available ModuleInterface configurations.
 * Add new configurations here as they are created.
 */
export function getAllAvailableConfigurations(): ModuleInterface[] {
  return [
    AshResourceConfig,
    AshPostgresConfig,
    AshPaperTrailConfig,
    AshAuthenticationConfig,
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
      console.log(`[CodeLens] Searching for keyword: "${keyword}" -> ${url}`);
      let keywordMatchCount = 0;
      
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
          
          console.log(`[CodeLens] Found "${keyword}" at line ${lineIndex + 1}, char ${keywordIndex}: "${line.trim()}"`);
          
          // Make sure it's a standalone word (not part of another word)
          const beforeChar = keywordIndex > 0 ? line[keywordIndex - 1] : ' ';
          const afterChar = keywordIndex + keyword.length < line.length ? line[keywordIndex + keyword.length] : ' ';
          
          console.log(`[CodeLens] Word boundary check: before="${beforeChar}" after="${afterChar}"`);
          
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
            keywordMatchCount++;
            console.log(`[CodeLens] ✅ Added code lens #${keywordMatchCount} for "${keyword}" at line ${lineIndex + 1}`);
          } else {
            console.log(`[CodeLens] ❌ Skipped "${keyword}" at line ${lineIndex + 1} - not a word boundary`);
          }
          
          // Move search index past this occurrence
          searchIndex = keywordIndex + keyword.length;
        }
      }
      
      console.log(`[CodeLens] Total matches for "${keyword}": ${keywordMatchCount}`);
    }
  }
  
  console.log(`[CodeLens] Extraction complete. Total code lenses generated: ${codeLenses.length}`);
  if (codeLenses.length > 0) {
    console.log(`[CodeLens] Code lenses summary:`, codeLenses.map(cl => `"${cl.title}" at line ${cl.line}`));
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
 * Each DSL block is associated with its specific parent module to avoid conflicts
 */
function extractModules(source: string, matchedModules: ModuleInterface[]): ParsedSection[] {
  const lines = source.split('\n');
  const sections: ParsedSection[] = [];
  const processedLines = new Set<number>(); // Track which lines we've already processed
  
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
      
      // Find which module(s) define this DSL block
      const matchingModules = matchedModules.filter(module => 
        module.dslBlocks.some(block => block.blockName === blockName)
      );
      
      if (matchingModules.length > 0) {
        // Use the first matching module (could be enhanced with priority logic)
        const owningModule = matchingModules[0];
        const dslBlock = owningModule.dslBlocks.find(block => block.blockName === blockName)!;
        
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
        
        // Parse child blocks within this section using the specific module context
        const details = parseChildBlocksForModule(rawContent, dslBlock, owningModule, startLine);
        
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
 * Parse child blocks within a parent DSL block for a specific module
 * This ensures children are properly associated with their parent module
 */
function parseChildBlocksForModule(
  parentContent: string, 
  parentBlock: DslBlock, 
  owningModule: ModuleInterface,
  parentStartLine: number
): ParsedDetail[] {
  const details: ParsedDetail[] = [];
  
  if (!parentBlock.children) {
    return details;
  }
  
  const lines = parentContent.split('\n');
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();
    
    // Look for child block patterns defined in this specific module
    for (const childBlock of parentBlock.children) {
      // First check if the line starts with the block name
      const blockNameRegex = new RegExp(`^${childBlock.blockName}\\s*[\\(\\s:]`);
      const blockMatch = trimmedLine.match(blockNameRegex);
      
      if (blockMatch) {
        const startLine = parentStartLine + lineIndex;
        let detailName = childBlock.blockName;
        let endLine = startLine;
        let rawContent = line;
        
        // If namePattern exists, extract the name
        if (childBlock.namePattern) {
          // For Elixir DSL, we need to look for patterns like ':name' or 'name'
          // in the portion of the line that comes after the block name
          const blockPos = line.indexOf(childBlock.blockName);
          const afterBlockName = line.substring(blockPos + childBlock.blockName.length).trim();
          
          // First try to find a match in the content after the block name
          const nameRegex = new RegExp(childBlock.namePattern);
          const nameMatch = afterBlockName.match(nameRegex);
          
          if (nameMatch && nameMatch[1]) {
            // We found a capture group, use it as the name
            detailName = nameMatch[1].trim();
          } else if (nameMatch) {
            // No capture group, use the entire match
            detailName = nameMatch[0].trim();
          }

          // Keep the leading colon for Elixir symbols as it's part of the syntax
          // We no longer remove it as we want to display it in the UI
        }
        
        // Detect the actual pattern used in the source code
        if (line.includes(' do:') || line.match(/,\s*do:\s*$/)) {
          // do: pattern - consume lines until no trailing comma
          rawContent = consumeDoColonBlock(lines, lineIndex);
          endLine = startLine + rawContent.split('\n').length - 1;
          lineIndex += rawContent.split('\n').length - 1;
          
        } else if (line.includes(' do\n') || line.trim().endsWith(' do')) {
          // do/end pattern - find the matching end
          const blockStartPos = parentContent.indexOf(line);
          const blockEndPos = findEndOfBlock(parentContent, blockStartPos);
          endLine = parentStartLine + parentContent.substring(0, blockEndPos).split('\n').length - 1;
          rawContent = parentContent.substring(blockStartPos, blockEndPos);
          
          // Skip lines that are part of this block
          const blockLineCount = rawContent.split('\n').length;
          lineIndex += blockLineCount - 1;
          
        } else {
          // Single line or multi-line without do (function call style)
          const multiLineContent = consumeMultiLineBlock(lines, lineIndex);
          rawContent = multiLineContent;
          endLine = startLine + multiLineContent.split('\n').length - 1;
          lineIndex += multiLineContent.split('\n').length - 1;
        }
        
        // Create the detail for this child block
        const childDetail: ParsedDetail = {
          section: parentBlock.blockName,
          detail: childBlock.blockName,
          name: detailName,
          line: startLine,
          column: 1, // Approximate for now
          endLine: endLine,
          rawContent: rawContent,
          properties: new Map<string, unknown>(),
        };
        
        details.push(childDetail);
        
        // RECURSIVE: If this child block has its own children, parse them recursively
        if (childBlock.children && childBlock.children.length > 0) {
          // Only recurse for do/end blocks that have content to parse
          if (line.includes(' do\n') || line.trim().endsWith(' do')) {
            const nestedDetails = parseChildBlocksForModule(
              rawContent,
              childBlock,
              owningModule,
              startLine
            );
            
            // Store nested details as children of the current detail instead of flattening
            if (nestedDetails.length > 0) {
              childDetail.childDetails = nestedDetails;
            }
          }
        }
        
        // Break after finding the first match to avoid duplicates
        break;
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
