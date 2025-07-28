import * as vscode from "vscode";
import { Logger } from "../../utils/logger";
import { Parser, ParseResult, ParsedSection, ParseError } from "../parser";
// Import the compiled Nearley grammar
import * as nearley from "nearley";
import grammar from "./nearley/ashGrammar.js";

/**
 * Helper type for AST nodes
 */
interface ASTNode {
  type: string;
  [key: string]: unknown;
}

/**
 * Type guard to check if a value is an AST node
 */
function isASTNode(value: unknown): value is ASTNode {
  return typeof value === "object" && value !== null && "type" in value;
}

/**
 * Grammar-based parser implementation using Nearley
 */
export class AshParser implements Parser {
  private static instance: AshParser;

  public static getInstance(): AshParser {
    if (!AshParser.instance) {
      AshParser.instance = new AshParser();
    }
    return AshParser.instance;
  }

  /**
   * Parse Ash DSL content from raw text (required by Parser interface)
   */
  public parse(source: string): ParseResult {
    return this.parseText(source);
  }

  /**
   * Parse Ash DSL content from a VS Code document
   */
  public parseDocument(document: vscode.TextDocument): ParseResult {
    const text = document.getText();
    return this.parseText(text);
  }

  /**
   * Parse Ash DSL content from raw text
   */
  public parseText(text: string): ParseResult {
    // Quick check if this looks like an Ash file
    const isAshFile = this.detectAshFile(text);

    if (!isAshFile) {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
        parserName: "AshParser",
      };
    }

    const logger = Logger.getInstance();

    try {
      logger.debug("AshParser", "Starting nearley grammar parse", {
        textLength: text.length,
      });

      // Create new parser instance with our grammar
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

      logger.debug("AshParser", "Parser created, feeding text...");
      parser.feed(text);

      logger.debug("AshParser", "Text fed to parser", {
        resultsCount: parser.results.length,
      });

      if (parser.results.length === 0) {
        logger.warn("AshParser", "No valid parse found");
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
          parserName: "AshParser",
        };
      }

      // Take the first successful parse result
      const ast = parser.results[0];
      logger.debug("AshParser", "AST extracted, processing sections...");

      // Convert AST to our interface format
      const sections = this.extractSections(ast, text);
      const moduleName = this.extractModuleName(ast);

      logger.debug("AshParser", "Parse completed successfully", {
        sectionsCount: sections.length,
      });

      return {
        sections,
        errors: [],
        isAshFile: true,
        moduleName,
        parserName: "AshParser",
      };
    } catch (error: unknown) {
      // More detailed error logging to identify crash location
      logger.error("AshParser", "Grammar parser crashed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        textPreview: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
      });

      // Parse error - extract position information if available
      const parseError = this.createParseError(error, text);

      return {
        sections: [],
        errors: [parseError],
        isAshFile: true,
        parserName: "AshParser",
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
  private extractSections(ast: unknown, originalText: string): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const logger = Logger.getInstance();

    // AST structure exploration and section extraction
    try {
      // The AST should represent a module_definition with a do_block containing expressions
      this.walkASTForSections(ast, sections, originalText);
    } catch (error) {
      // If AST walking fails, gracefully return empty sections
      logger.warn("AshParser", "AST traversal failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return sections;
  }

  /**
   * Recursively walk the AST to find Ash DSL sections
   */
  private walkASTForSections(
    node: unknown,
    sections: ParsedSection[],
    originalText: string
  ): void {
    if (!node) return;

    // Handle different node types
    if (Array.isArray(node)) {
      node.forEach(child =>
        this.walkASTForSections(child, sections, originalText)
      );
      return;
    }

    if (typeof node === "object" && node !== null) {
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
      Object.values(node).forEach(value => {
        this.walkASTForSections(value, sections, originalText);
      });
    }
  }

  /**
   * Check if a node represents an Ash DSL section
   */
  private isAshSection(node: unknown, sectionKeywords: string[]): boolean {
    // Look for patterns that indicate this is a section:
    // - A function/identifier followed by a do block
    // - The identifier matches known section keywords

    if (!isASTNode(node)) {
      return false;
    }

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
    node: unknown,
    originalText: string
  ): ParsedSection | null {
    if (!isASTNode(node)) {
      return null;
    }

    try {
      const identifier = this.extractIdentifier(node);
      if (!identifier) return null;

      // Calculate line/column positions
      // This is simplified - in a real implementation we'd track positions through the parser
      const lines = originalText.split("\n");
      let line = 0;

      // Find the section in the original text
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(identifier) && lines[i].includes("do")) {
          line = i;
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
        section: identifier,
        details: [], // TODO: Extract section details in future iteration
        startLine: line + 1, // Convert to 1-based
        endLine: endLine + 1, // Convert to 1-based
        rawContent: lines.slice(line, endLine + 1).join("\n"),
      };
    } catch (error) {
      const logger = Logger.getInstance();
      logger.warn("AshParser", "Failed to create section from node", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Extract identifier from AST node
   */
  private extractIdentifier(node: unknown): string | null {
    // This depends on our AST structure - we'll need to adjust based on actual output
    if (typeof node === "string") return node;

    if (!isASTNode(node)) {
      return null;
    }

    if (node.value && typeof node.value === "string") return node.value;
    if (node.identifier && typeof node.identifier === "string")
      return node.identifier;
    if (node.name && typeof node.name === "string") return node.name;

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
   * Extract module name from AST
   */
  private extractModuleName(ast: unknown): string | undefined {
    // TODO: Implement module name extraction from AST
    // For now, just return undefined since AST structure needs to be analyzed
    console.log("AST for module name extraction:", ast);
    return undefined;
  }

  /**
   * Convert parsing errors to our error format
   */
  private createParseError(error: unknown, text: string): ParseError {
    // Type guard for error with token property
    const hasToken = (
      err: unknown
    ): err is {
      token: { offset: number; value: string };
      message?: string;
    } => {
      return typeof err === "object" && err !== null && "token" in err;
    };

    // Type guard for error with message property
    const hasMessage = (err: unknown): err is { message: string } => {
      return typeof err === "object" && err !== null && "message" in err;
    };

    // Nearley provides error information in error.token
    if (hasToken(error)) {
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
    const message = hasMessage(error) ? error.message : "Parse error";
    return {
      message,
      line: 0,
      column: 0,
      offset: 0,
    };
  }
}

/**
 * Convenience function to get parser instance and parse a document
 */
export function parseAshDocument(document: vscode.TextDocument): ParseResult {
  return AshParser.getInstance().parseDocument(document);
}

/**
 * Convenience function to parse text directly
 */
export function parseAshText(text: string): ParseResult {
  return AshParser.getInstance().parseText(text);
}
