import * as vscode from "vscode";

/**
 * Production-ready fallback parser for Ash DSL files
 * Handles cases where the formal grammar parser fails or is incomplete
 * Designed as a permanent component of the parsing strategy
 */

export interface MacroDetail {
  type: "macro";
  name: string;
  macroName: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  rawContent: string;
  properties: Map<string, any>; // For compatibility with grammar parser
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

export interface AshSection {
  type: string;
  name: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  children: MacroDetail[];
  rawContent: string;
}

export interface SimpleParseResult {
  isAshFile: boolean;
  sections: AshSection[];
  errors: ParseError[];
  moduleName?: string;
}

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

export function parseAshDocumentSimple(
  document: vscode.TextDocument
): SimpleParseResult {
  const text = document.getText();
  const lines = text.split("\n");

  // Check if this is an Ash file (Resource, Domain, or Type)
  const isAshResource = REGEX_PATTERNS.ashResource.test(text);
  const isAshType = REGEX_PATTERNS.ashType.test(text);
  const isAshFile = isAshResource || isAshType;

  if (!isAshFile) {
    return {
      isAshFile: false,
      sections: [],
      errors: [],
    };
  }

  const sections: AshSection[] = [];
  const errors: ParseError[] = [];

  // Handle Ash.Type.Enum files (simple, no DSL blocks)
  if (isAshType && !isAshResource) {
    try {
      const typeMatch = text.match(REGEX_PATTERNS.typeMatch);
      if (typeMatch) {
        const typeName = typeMatch[1]; // "Enum", "Union", etc.
        const typeConfig = typeMatch[2]; // "values: [:admin, :editor, :user]"

        sections.push({
          type: "type_definition",
          name: `${typeName.toLowerCase()}_definition`,
          line: lines.findIndex((line) => line.includes("use Ash.Type")),
          column: 0,
          endLine: lines.length - 1,
          endColumn: lines[lines.length - 1].length,
          children: [], // TODO: Could parse individual enum values
          rawContent: typeConfig,
        });
      }
    } catch (error) {
      errors.push({
        message: `Failed to parse Ash type definition: ${
          error instanceof Error ? error.message : String(error)
        }`,
        line: 0,
        column: 0,
        offset: 0,
      });
    }

    return {
      isAshFile: true,
      sections,
      errors,
      moduleName: extractModuleName(text),
    };
  }

  // Parse DSL blocks using optimized patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const match = line.match(REGEX_PATTERNS.blockPattern);
    if (match) {
      const sectionName = match[1];
      const startLine = i;
      const startColumn = line.indexOf(sectionName);

      try {
        // Find the matching 'end' for this block
        let endLine = startLine;
        let blockDepth = 1;
        let endColumn = 0;

        for (let j = i + 1; j < lines.length && blockDepth > 0; j++) {
          const currentLine = lines[j];
          // Reset regex lastIndex to avoid issues with global regexes
          REGEX_PATTERNS.doKeyword.lastIndex = 0;
          REGEX_PATTERNS.endKeyword.lastIndex = 0;

          // Count 'do' and 'end' to track nesting
          const doMatches = (currentLine.match(REGEX_PATTERNS.doKeyword) || [])
            .length;
          const endMatches = (
            currentLine.match(REGEX_PATTERNS.endKeyword) || []
          ).length;

          blockDepth = blockDepth + doMatches - endMatches;

          if (blockDepth === 0) {
            endLine = j;
            endColumn = currentLine.length;
            break;
          }
        }

        sections.push({
          type: "generic",
          name: sectionName,
          line: startLine,
          column: startColumn,
          endLine: endLine,
          endColumn: endColumn,
          children: parseInnerMacros(lines, startLine, endLine, errors), // Pass errors array
          rawContent: lines.slice(startLine, endLine + 1).join("\n"),
        });
      } catch (error) {
        errors.push({
          message: `Failed to parse section '${sectionName}' on line ${
            i + 1
          }: ${error instanceof Error ? error.message : String(error)}`,
          line: i,
          column: startColumn,
          offset: 0,
        });
      }
    }
  }

  return {
    isAshFile: true,
    sections,
    errors,
    moduleName: extractModuleName(text),
  };
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
): MacroDetail[] {
  const children: MacroDetail[] = [];

  for (let i = startLine + 1; i < endLine; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines, comments, and end tokens
    if (!trimmed || trimmed.startsWith("#") || trimmed === "end") continue;

    try {
      // Pattern for top-level macros with first argument extraction
      // Handle various forms:
      //   attribute :name, :string do
      //   create :create do
      //   reference(:album, index?: true, on_delete: :delete)
      //   primary?(true)
      //   uuid_primary_key(:id)
      const macroMatch = trimmed.match(REGEX_PATTERNS.macroPattern);

      if (macroMatch) {
        const macroName = macroMatch[1];
        const firstArg = macroMatch[2];

        // If this line has a 'do' at the end, it starts a nested block
        // We should capture this macro but then skip its content
        if (trimmed.endsWith(" do")) {
          // Find the matching 'end' for this nested block and skip to it
          let nestedDepth = 1;
          let j = i + 1;
          while (j < endLine && nestedDepth > 0) {
            const nestedLine = lines[j].trim();
            // Reset regex lastIndex to avoid issues with global regexes
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
          type: "macro",
          name: displayName,
          macroName: macroName,
          line: i,
          column: line.indexOf(trimmed),
          endLine: i,
          endColumn: line.length,
          rawContent: line,
          properties: new Map(), // Empty properties map for simple parser
        });
      }
    } catch (error) {
      errors.push({
        message: `Failed to parse macro on line ${i + 1}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        line: i,
        column: 0,
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
