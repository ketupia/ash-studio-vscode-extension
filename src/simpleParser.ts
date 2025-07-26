import * as vscode from "vscode";

/**
 * Simple regex-based parser for testing the architecture
 * This is a temporary fallback while we improve the grammar-based parser
 */

export interface SimpleParseResult {
  isAshFile: boolean;
  sections: Array<{
    type: string;
    name: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    children: any[];
    rawContent: string;
  }>;
  errors: Array<{
    message: string;
    line: number;
    column: number;
    offset: number;
  }>;
  moduleName?: string;
}

export function parseAshDocumentSimple(
  document: vscode.TextDocument
): SimpleParseResult {
  const text = document.getText();
  const lines = text.split("\n");

  // Check if this is an Ash file
  const isAshFile = /use\s+Ash\.(Resource|Domain)/.test(text);

  if (!isAshFile) {
    return {
      isAshFile: false,
      sections: [],
      errors: [],
    };
  }

  const sections: SimpleParseResult["sections"] = [];
  const errors: SimpleParseResult["errors"] = [];

  // Simple regex patterns for common Ash DSL blocks
  const blockPatterns = [
    /^\s*(attributes|actions|relationships|calculations|aggregates|identities|policies|preparations|changes|validations|postgres|graphql|json_api|admin)\s+do\s*$/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of blockPatterns) {
      const match = line.match(pattern);
      if (match) {
        const sectionName = match[1];
        const startLine = i;
        const startColumn = line.indexOf(sectionName);

        // Find the matching 'end' for this block
        let endLine = startLine;
        let blockDepth = 1;
        let endColumn = 0;

        for (let j = i + 1; j < lines.length && blockDepth > 0; j++) {
          const currentLine = lines[j];
          // Count 'do' and 'end' to track nesting
          const doMatches = (currentLine.match(/\bdo\b/g) || []).length;
          const endMatches = (currentLine.match(/\bend\b/g) || []).length;

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
          children: [], // TODO: Parse section details
          rawContent: lines.slice(startLine, endLine + 1).join("\n"),
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
  const match = text.match(/defmodule\s+([A-Za-z_][A-Za-z0-9_.]*)/);
  return match ? match[1] : undefined;
}
