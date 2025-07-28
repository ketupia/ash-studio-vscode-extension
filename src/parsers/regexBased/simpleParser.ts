import * as vscode from "vscode";
import {
  Parser,
  ParseResult,
  ParsedSection,
  ParsedDetail,
  ParseError,
} from "../parser";

/**
 * Production-ready fallback parser for Ash DSL files
 * Handles cases where the formal grammar parser fails or is incomplete
 * Designed as a permanent component of the parsing strategy
 */

// Pre-compiled regex patterns for performance
const ASH_DSL_SECTIONS = [
  "attributes",
  "actions",
  "relationships",
  "calculations",
  "aggregates",
  "identities",
  "policies",
  "preparations",
  "changes",
  "validations",
  "postgres",
  "graphql",
  "json_api",
  "admin",
] as const;

const REGEX_PATTERNS = {
  ashResource: /use\s+Ash\.(Resource|Domain)/,
  ashType: /use\s+Ash\.Type\.(Enum|Union|NewType)/,
  blockPattern: new RegExp(`^\\s*(${ASH_DSL_SECTIONS.join("|")})\\s+do\\s*$`),
  typeMatch: /use\s+Ash\.Type\.(\w+),?\s*(.+)/,
  moduleName: /defmodule\s+([A-Za-z_][A-Za-z0-9_.]*)/,
  macroPattern: /^(\w+[?!]?)\s*(?:\(?\s*([^,\s)]+))/,
  doKeyword: /\bdo\b/g,
  endKeyword: /\bend\b/g,
  quotedString: /^["'].*["']$/,
  listStart: /^\[([^,\]]+)/,
} as const;

/**
 * Regex-based parser implementation
 */
export class SimpleParser implements Parser {
  parse(source: string): ParseResult {
    const lines = source.split("\n");

    // Check if this is an Ash file (Resource, Domain, or Type)
    const isAshResource = REGEX_PATTERNS.ashResource.test(source);
    const isAshType = REGEX_PATTERNS.ashType.test(source);
    const isAshFile = isAshResource || isAshType;

    if (!isAshFile) {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
        parserName: "SimpleParser",
        codeLenses: [],
      };
    }

    const sections: ParsedSection[] = [];
    const errors: ParseError[] = [];

    // Handle Ash.Type.Enum files (simple, no DSL blocks)
    if (isAshType && !isAshResource) {
      try {
        const typeMatch = source.match(REGEX_PATTERNS.typeMatch);
        if (typeMatch) {
          const typeName = typeMatch[1]; // "Enum", "Union", etc.
          const typeConfig = typeMatch[2]; // "values: [:admin, :editor, :user]"

          sections.push({
            section: `${typeName.toLowerCase()}_definition`,
            details: [], // TODO: Could parse individual enum values
            startLine:
              lines.findIndex(line => line.includes("use Ash.Type")) + 1, // 1-based
            endLine: lines.length, // 1-based
            rawContent: typeConfig,
          });
        }
      } catch (error) {
        errors.push({
          message: `Failed to parse Ash type definition: ${
            error instanceof Error ? error.message : String(error)
          }`,
          line: 1,
          column: 1,
          offset: 0,
        });
      }

      return {
        sections,
        errors,
        isAshFile: true,
        moduleName: extractModuleName(source),
        parserName: "SimpleParser",
        codeLenses: [],
      };
    }

    // Parse DSL blocks using optimized patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const match = line.match(REGEX_PATTERNS.blockPattern);
      if (match) {
        const sectionName = match[1];
        const startLine = i + 1; // Convert to 1-based
        const startColumn = line.indexOf(sectionName);

        try {
          // Find the matching 'end' for this block
          let endLine = startLine;
          let blockDepth = 1;

          for (let j = i + 1; j < lines.length && blockDepth > 0; j++) {
            const currentLine = lines[j];
            // Reset regex lastIndex to avoid issues with global regexes
            REGEX_PATTERNS.doKeyword.lastIndex = 0;
            REGEX_PATTERNS.endKeyword.lastIndex = 0;

            // Count 'do' and 'end' to track nesting
            const doMatches = (
              currentLine.match(REGEX_PATTERNS.doKeyword) || []
            ).length;
            const endMatches = (
              currentLine.match(REGEX_PATTERNS.endKeyword) || []
            ).length;

            blockDepth = blockDepth + doMatches - endMatches;

            if (blockDepth === 0) {
              endLine = j + 1; // Convert to 1-based
              break;
            }
          }

          sections.push({
            section: sectionName,
            details: parseInnerMacros(lines, i, endLine - 1, errors), // Convert back to 0-based for parsing
            startLine: startLine,
            endLine: endLine,
            rawContent: lines.slice(i, endLine).join("\n"),
          });
        } catch (error) {
          errors.push({
            message: `Failed to parse section '${sectionName}' on line ${startLine}: ${
              error instanceof Error ? error.message : String(error)
            }`,
            line: startLine,
            column: startColumn + 1, // Convert to 1-based
            offset: 0,
          });
        }
      }
    }

    return {
      sections,
      errors,
      isAshFile: true,
      moduleName: extractModuleName(source),
      parserName: "SimpleParser",
      codeLenses: [],
    };
  }
}

function extractModuleName(text: string): string | undefined {
  const match = text.match(REGEX_PATTERNS.moduleName);
  return match ? match[1] : undefined;
}

function parseInnerMacros(
  lines: string[],
  startLine: number,
  endLine: number,
  errors: ParseError[]
): ParsedDetail[] {
  const children: ParsedDetail[] = [];

  for (let i = startLine + 1; i < endLine; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines, comments, and end tokens
    if (!trimmed || trimmed.startsWith("#") || trimmed === "end") continue;

    try {
      // Pattern for top-level macros with first argument extraction
      const macroMatch = trimmed.match(REGEX_PATTERNS.macroPattern);

      if (macroMatch) {
        const macroName = macroMatch[1];
        const firstArg = macroMatch[2];

        // If this line has a 'do' at the end, it starts a nested block
        if (trimmed.endsWith(" do")) {
          // Find the matching 'end' for this nested block and skip to it
          let nestedDepth = 1;
          let j = i + 1;
          while (j < endLine && nestedDepth > 0) {
            const nestedLine = lines[j].trim();
            REGEX_PATTERNS.doKeyword.lastIndex = 0;
            REGEX_PATTERNS.endKeyword.lastIndex = 0;

            const doCount = (nestedLine.match(REGEX_PATTERNS.doKeyword) || [])
              .length;
            const endCount = (nestedLine.match(REGEX_PATTERNS.endKeyword) || [])
              .length;
            nestedDepth += doCount - endCount;
            j++;
          }
          // Skip to after the nested block
          i = j - 1;
        }

        // Extract a clean first argument (remove : prefix from atoms, quotes from strings)
        let displayName = macroName;
        if (firstArg) {
          displayName = cleanArgument(firstArg);
        }

        children.push({
          section: "macro", // The parent section will be set correctly
          detail: macroName,
          name: displayName,
          line: i + 1, // Convert to 1-based
          column: line.indexOf(trimmed) + 1, // Convert to 1-based
          endLine: i + 1, // Convert to 1-based
          rawContent: line,
          properties: new Map(), // Empty properties map for simple parser
        });
      }
    } catch (error) {
      errors.push({
        message: `Failed to parse macro on line ${i + 1}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        line: i + 1, // Convert to 1-based
        column: 1,
        offset: 0,
      });
    }
  }

  return children;
}

function cleanArgument(arg: string): string {
  let cleanArg = arg.trim();

  // Handle atoms (:name -> name)
  if (cleanArg.startsWith(":")) {
    cleanArg = cleanArg.substring(1);
  }
  // Handle strings ("name" -> name)
  else if (cleanArg.match(REGEX_PATTERNS.quotedString)) {
    cleanArg = cleanArg.slice(1, -1);
  }
  // Handle lists ([:read -> read, etc.)
  else if (cleanArg.startsWith("[")) {
    const listMatch = cleanArg.match(REGEX_PATTERNS.listStart);
    if (listMatch) {
      cleanArg = listMatch[1];
      if (cleanArg.startsWith(":")) {
        cleanArg = cleanArg.substring(1);
      }
    }
  }

  return cleanArg;
}

// Legacy function for backward compatibility
export function parseAshDocumentSimple(
  document: vscode.TextDocument
): ParseResult {
  const parser = new SimpleParser();
  return parser.parse(document.getText());
}
