import * as vscode from "vscode";
import { ParseResult } from "./types/parser";
import { moduleParser } from "./parser/moduleParser";
import { Logger } from "./utils/logger";
import { isElixirFile } from "./utils/fileUtils";

/**
 * ParsedDataProvider
 * ------------------
 * Centralized singleton for caching and providing parsed results of Elixir source files.
 *
 * Responsibilities:
 * - Maintains a cache of parse results keyed by document URI and version.
 * - Delegates parsing to the injected Parser implementation (default: moduleParser).
 * - Emits events when documents are parsed (for sidebar, CodeLens, etc.).
 * - Provides methods for cache management and document activation.
 * - Isolates VS Code API usage from pure parsing logic.
 *
 * Architectural Notes:
 * - All parsing logic is handled by Parser modules (see src/parser/).
 * - This provider is a singleton; use getInstance() for access.
 * - Pure logic modules (parsers, models) do not depend on VS Code APIs.
 * - Feature modules (sidebar, quick pick, navigation) depend on this provider for parsed data.
 *
 * Usage:
 *   const provider = ParsedDataProvider.getInstance();
 *   const result = provider.getParseResult(document);
 *
 * See CONTRIBUTING.md for architectural and commenting guidelines.
 */
export class ParsedDataProvider {
  private static instance: ParsedDataProvider;
  private parseCache = new Map<
    string,
    { result: ParseResult; version: number }
  >();

  static getInstance(): ParsedDataProvider {
    if (!ParsedDataProvider.instance) {
      ParsedDataProvider.instance = new ParsedDataProvider();
    }
    return ParsedDataProvider.instance;
  }

  /**
   * Get parse result for a document, using cache if available
   */
  public getParseResult(document: vscode.TextDocument): ParseResult {
    const logger = Logger.getInstance();

    if (!isElixirFile(document)) {
      logger.debug(
        "ParsedDataProvider",
        "Document is not an Elixir file, returning empty parse result"
      );
      return {
        sections: [],
        diagramCodeLenses: [],
        definitionEntries: [],
      };
    }

    const uri = document.uri.toString();
    const version = document.version;

    // Check if we have a cached result for this document version
    const cached = this.parseCache.get(uri);
    if (cached && cached.version === version) {
      return cached.result;
    }

    const source = document.getText();
    let result: ParseResult;

    try {
      // Pass file path to parser for diagram CodeLens support
      result = moduleParser.parse(source, document.uri.fsPath);
      logger.debug("ParsedDataProvider", `Parser succeeded`, {
        sectionsFound: result.sections.length,
        diagramCodeLensesFound: result.diagramCodeLenses.length,
      });
    } catch (error) {
      logger.error("ParsedDataProvider", "Parser failed with an error", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Fallback to an empty result on error
      result = {
        sections: [],
        diagramCodeLenses: [],
        definitionEntries: [],
      };
    }

    // Cache the result
    this.parseCache.set(uri, { result, version });

    return result;
  }

  /**
   * Clear cache for a specific document
   */
  public clearCache(document: vscode.TextDocument): void {
    const uri = document.uri.toString();
    this.parseCache.delete(uri);
  }

  /**
   * Called when a document is activated. Parses and emits results, using cache if available.
   */
  public documentActivated(document: vscode.TextDocument): ParseResult {
    const result = this.getParseResult(document);
    return result;
  }
}
