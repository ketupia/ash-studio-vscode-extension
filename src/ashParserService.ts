import * as vscode from "vscode";
import { Parser, ParseResult } from "./parsers/parser";
import { moduleParser } from "./parsers/moduleParser";
import { Logger } from "./utils/logger";

/**
 * Centralized parser service that caches parse results and manages updates
 */
export class AshParserService {
  private static instance: AshParserService;
  private parseCache = new Map<
    string,
    { result: ParseResult; version: number }
  >();
  private _onDidParse = new vscode.EventEmitter<ParseResult>();

  // The single parser implementation
  private parser: Parser = moduleParser;

  public readonly onDidParse = this._onDidParse.event;

  static getInstance(): AshParserService {
    if (!AshParserService.instance) {
      AshParserService.instance = new AshParserService();
    }
    return AshParserService.instance;
  }

  /**
   * Get parse result for a document, using cache if available
   */
  public getParseResult(document: vscode.TextDocument): ParseResult {
    const uri = document.uri.toString();
    const version = document.version;

    // Check if we have a cached result for this document version
    const cached = this.parseCache.get(uri);
    if (cached && cached.version === version) {
      return cached.result;
    }

    // Use the single parser
    const source = document.getText();
    const logger = Logger.getInstance();
    let result: ParseResult;

    try {
      result = this.parser.parse(source);
      logger.debug(
        "AshParserService",
        `Parser ${result.parserName} succeeded`,
        {
          sectionsFound: result.sections.length,
          codeLensesFound: result.codeLenses.length,
        }
      );
    } catch (error) {
      logger.error("AshParserService", "Parser failed with an error", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Fallback to an empty result on error
      result = {
        sections: [],
        parserName: "ErrorFallback",
        codeLenses: [],
      };
    }

    // Cache the result
    this.parseCache.set(uri, { result, version });

    // Notify listeners
    this._onDidParse.fire(result);

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
   * Clear all cached results
   */
  public clearAllCache(): void {
    this.parseCache.clear();
  }

  /**
   * Get cached result without parsing (returns undefined if not cached)
   */
  public getCachedResult(
    document: vscode.TextDocument
  ): ParseResult | undefined {
    const uri = document.uri.toString();
    const version = document.version;
    const cached = this.parseCache.get(uri);

    if (cached && cached.version === version) {
      return cached.result;
    }
    return undefined;
  }

  /**
   * Parse document only if it's an Elixir file, otherwise return empty result
   */
  public parseElixirDocument(document: vscode.TextDocument): ParseResult {
    // Skip non-Elixir files
    if (document.languageId !== "elixir") {
      return {
        sections: [],
        parserName: "LanguageFilter",
        codeLenses: [],
      };
    }

    return this.getParseResult(document);
  }

  /**
   * Called when a document is activated. Parses and emits results, using cache if available.
   */
  public documentActivated(document: vscode.TextDocument): ParseResult {
    const cached = this.getCachedResult(document);
    if (cached) {
      return cached;
    }
    return this.getParseResult(document);
  }
}
