import * as vscode from "vscode";
import { parseAshDocument, AshParseResult } from "./ashParser";
import { parseAshDocumentSimple, SimpleParseResult } from "./simpleParser";

// Strategy: Try detailed parser first, fallback to simple parser on errors
const USE_GRACEFUL_FALLBACK = true;

/**
 * Centralized parser service that caches parse results and manages updates
 */
export class AshParserService {
  private static instance: AshParserService;
  private parseCache = new Map<
    string,
    { result: AshParseResult; version: number }
  >();
  private _onDidParse = new vscode.EventEmitter<AshParseResult>();

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
  public getParseResult(document: vscode.TextDocument): AshParseResult {
    const uri = document.uri.toString();
    const version = document.version;

    // Check if we have a cached result for this document version
    const cached = this.parseCache.get(uri);
    if (cached && cached.version === version) {
      return cached.result;
    }

    // Parse the document with graceful fallback strategy
    let result: AshParseResult;

    if (USE_GRACEFUL_FALLBACK) {
      try {
        // First attempt: try the detailed grammar parser
        console.log("[Ash Studio] Attempting detailed parser...");
        result = parseAshDocument(document);

        // Check if parser succeeded but has errors
        if (result.errors && result.errors.length > 0) {
          console.log(
            "[Ash Studio] Detailed parser had errors, falling back to simple parser"
          );
          result = parseAshDocumentSimple(document) as AshParseResult;
        } else {
          console.log("[Ash Studio] Detailed parser succeeded");
        }
      } catch (error) {
        // Fallback: use simple parser if detailed parser throws
        console.log(
          "[Ash Studio] Detailed parser failed, using simple parser fallback:",
          error
        );
        result = parseAshDocumentSimple(document) as AshParseResult;
      }
    } else {
      // Direct simple parser (for testing)
      result = parseAshDocumentSimple(document) as AshParseResult;
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
  ): AshParseResult | undefined {
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
  public parseElixirDocument(document: vscode.TextDocument): AshParseResult {
    // Skip non-Elixir files
    if (document.languageId !== "elixir") {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
      };
    }

    return this.getParseResult(document);
  }
}
