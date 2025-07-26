import * as vscode from "vscode";
// Import the compiled Nearley grammar
const nearley = require("nearley");
const grammar = require("./nearley/ashGrammar.js");

/**
 * Core interfaces for Ash DSL parsing integration
 */

export interface ParseError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

export interface AshSectionDetail {
  type: string; // e.g., "attribute", "action", "relationship"
  name: string; // e.g., "email", "create", "posts"
  line: number; // 0-based line number
  column: number; // 0-based column number
  endLine: number; // 0-based end line
  properties: Map<string, any>; // parsed properties like type: :string, allow_nil?: true
  rawContent: string; // original text content
}

export interface AshSection {
  type:
    | "resource"
    | "domain"
    | "attributes"
    | "actions"
    | "relationships"
    | "calculations"
    | "aggregates"
    | "identities"
    | "code_interface"
    | "postgres"
    | "policies"
    | "preparations"
    | "changes"
    | "validations"
    | "generic";
  name: string; // section name, e.g., "attributes", "actions"
  line: number; // 0-based line number where section starts
  column: number; // 0-based column number
  endLine: number; // 0-based line number where section ends
  endColumn: number; // 0-based end column
  children: AshSectionDetail[]; // parsed details within this section
  rawContent: string; // original text content of entire section
}

export interface AshParseResult {
  sections: AshSection[];
  errors: ParseError[];
  isAshFile: boolean; // whether this appears to be an Ash Resource/Domain file
  moduleName?: string; // extracted module name if available
}

/**
 * Main parser integration class
 */
export class AshParser {
  private static instance: AshParser;

  public static getInstance(): AshParser {
    if (!AshParser.instance) {
      AshParser.instance = new AshParser();
    }
    return AshParser.instance;
  }

  /**
   * Parse Ash DSL content from a VS Code document
   */
  public parseDocument(document: vscode.TextDocument): AshParseResult {
    const text = document.getText();
    return this.parseText(text);
  }

  /**
   * Parse Ash DSL content from raw text
   */
  public parseText(text: string): AshParseResult {
    // Quick check if this looks like an Ash file
    const isAshFile = this.detectAshFile(text);

    if (!isAshFile) {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
      };
    }

    try {
      // Create new parser instance with our grammar
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      parser.feed(text);

      if (parser.results.length === 0) {
        return {
          sections: [],
          errors: [
            {
              message: "No valid parse found",
              line: 0,
              column: 0,
              offset: 0,
            },
          ],
          isAshFile: true,
        };
      }

      // Take the first successful parse result
      const ast = parser.results[0];

      // Convert AST to our interface format
      const sections = this.extractSections(ast, text);
      const moduleName = this.extractModuleName(ast);

      return {
        sections,
        errors: [],
        isAshFile: true,
        moduleName,
      };
    } catch (error: any) {
      // Parse error - extract position information if available
      const parseError = this.createParseError(error, text);

      return {
        sections: [],
        errors: [parseError],
        isAshFile: true,
      };
    }
  }

  /**
   * Quick heuristic to detect if this is an Ash Resource or Domain file
   */
  private detectAshFile(text: string): boolean {
    // Look for Ash.Resource or Ash.Domain usage
    const ashUsageRegex = /use\s+Ash\.(Resource|Domain)/;
    return ashUsageRegex.test(text);
  }

  /**
   * Extract sections from the parsed AST
   */
  private extractSections(ast: any, originalText: string): AshSection[] {
    const sections: AshSection[] = [];

    // AST structure exploration and section extraction
    try {
      // The AST should represent a module_definition with a do_block containing expressions
      this.walkASTForSections(ast, sections, originalText);
    } catch (error) {
      // If AST walking fails, gracefully return empty sections
      console.warn("AST traversal failed:", error);
    }

    return sections;
  }

  /**
   * Recursively walk the AST to find Ash DSL sections
   */
  private walkASTForSections(
    node: any,
    sections: AshSection[],
    originalText: string
  ): void {
    if (!node) return;

    // Handle different node types
    if (Array.isArray(node)) {
      node.forEach((child) =>
        this.walkASTForSections(child, sections, originalText)
      );
      return;
    }

    if (typeof node === "object") {
      // Look for section-like patterns in the AST
      // These are common Ash DSL section names
      const sectionKeywords = [
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
        "code_interface",
        "postgres",
      ];

      // Check if this node represents a section
      if (this.isAshSection(node, sectionKeywords)) {
        const section = this.createSectionFromNode(node, originalText);
        if (section) {
          sections.push(section);
        }
      }

      // Recursively traverse object properties
      Object.values(node).forEach((value) => {
        this.walkASTForSections(value, sections, originalText);
      });
    }
  }

  /**
   * Check if a node represents an Ash DSL section
   */
  private isAshSection(node: any, sectionKeywords: string[]): boolean {
    // Look for patterns that indicate this is a section:
    // - A function/identifier followed by a do block
    // - The identifier matches known section keywords

    if (
      node.type === "simple_keyword_block" ||
      node.type === "generic_do_end_block"
    ) {
      const identifier = this.extractIdentifier(node);
      return identifier !== null && sectionKeywords.includes(identifier);
    }

    // Also check for direct keyword matches in the AST structure
    if (typeof node === "string" && sectionKeywords.includes(node)) {
      return true;
    }

    return false;
  }

  /**
   * Create an AshSection from an AST node
   */
  private createSectionFromNode(
    node: any,
    originalText: string
  ): AshSection | null {
    try {
      const identifier = this.extractIdentifier(node);
      if (!identifier) return null;

      // Calculate line/column positions
      // This is simplified - in a real implementation we'd track positions through the parser
      const lines = originalText.split("\n");
      let line = 0;
      let column = 0;

      // Find the section in the original text
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(identifier) && lines[i].includes("do")) {
          line = i;
          column = lines[i].indexOf(identifier);
          break;
        }
      }

      // Find the end of the section (matching 'end')
      let endLine = line;
      for (let i = line + 1; i < lines.length; i++) {
        if (lines[i].trim() === "end") {
          endLine = i;
          break;
        }
      }

      return {
        type: this.mapSectionType(identifier),
        name: identifier,
        line,
        column,
        endLine,
        endColumn: 3, // "end".length
        children: [], // TODO: Extract section details in future iteration
        rawContent: lines.slice(line, endLine + 1).join("\n"),
      };
    } catch (error) {
      console.warn("Failed to create section from node:", error);
      return null;
    }
  }

  /**
   * Extract identifier from AST node
   */
  private extractIdentifier(node: any): string | null {
    // This depends on our AST structure - we'll need to adjust based on actual output
    if (typeof node === "string") return node;
    if (node.value && typeof node.value === "string") return node.value;
    if (node.identifier) return node.identifier;
    if (node.name) return node.name;

    // Look in common AST properties
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const id = this.extractIdentifier(child);
        if (id) return id;
      }
    }

    return null;
  }

  /**
   * Map section name to our section type
   */
  private mapSectionType(sectionName: string): AshSection["type"] {
    const typeMap: Record<string, AshSection["type"]> = {
      attributes: "attributes",
      actions: "actions",
      relationships: "relationships",
      calculations: "calculations",
      aggregates: "aggregates",
      identities: "identities",
      policies: "policies",
      preparations: "preparations",
      changes: "changes",
      validations: "validations",
      code_interface: "code_interface",
      postgres: "postgres",
    };

    return typeMap[sectionName] || "generic";
  }

  /**
   * Extract module name from AST
   */
  private extractModuleName(ast: any): string | undefined {
    // TODO: Implement module name extraction from AST
    return undefined;
  }

  /**
   * Convert parsing errors to our error format
   */
  private createParseError(error: any, text: string): ParseError {
    // Nearley provides error information in error.token
    if (error.token) {
      const lines = text.substring(0, error.token.offset).split("\n");
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;

      return {
        message: error.message || `Unexpected token: ${error.token.value}`,
        line,
        column,
        offset: error.token.offset,
      };
    }

    // Fallback for other error types
    return {
      message: error.message || "Parse error",
      line: 0,
      column: 0,
      offset: 0,
    };
  }
}

/**
 * Convenience function to get parser instance and parse a document
 */
export function parseAshDocument(
  document: vscode.TextDocument
): AshParseResult {
  return AshParser.getInstance().parseDocument(document);
}

/**
 * Convenience function to parse text directly
 */
export function parseAshText(text: string): AshParseResult {
  return AshParser.getInstance().parseText(text);
}
