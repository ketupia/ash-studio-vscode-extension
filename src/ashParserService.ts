import * as vscode from "vscode";
import { parseAshDocument, AshParseResult } from "./ashParser";
import { parseAshDocumentSimple, SimpleParseResult } from "./simpleParser";
import { Logger } from "./utils/logger";

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
    const logger = Logger.getInstance();

    if (USE_GRACEFUL_FALLBACK) {
      try {
        // Pre-check for ANY complex patterns that might crash nearley
        const text = document.getText();

        // Skip grammar parser for files with any potentially problematic patterns
        const hasComplexExpr = text.includes("expr(");
        const hasStringInterpolation = text.includes("#{");
        const hasMultiLineStructures =
          text.includes("\n") && text.includes("do\n");
        const hasConditionalLogic =
          text.includes("if ") && text.includes("do:");
        const isLargeFile = text.length > 5000; // Skip large files entirely

        if (
          hasComplexExpr ||
          hasStringInterpolation ||
          hasMultiLineStructures ||
          hasConditionalLogic ||
          isLargeFile
        ) {
          logger.info(
            "AshParserService",
            "Detected potentially problematic patterns, using simple parser only",
            {
              hasComplexExpr,
              hasStringInterpolation,
              hasMultiLineStructures,
              hasConditionalLogic,
              isLargeFile,
              fileSize: text.length,
            }
          );
          result = parseAshDocumentSimple(document) as AshParseResult;
        } else {
          // Only try grammar parser on very simple, small files
          logger.debug(
            "AshParserService",
            "File appears safe for grammar parser"
          );

          try {
            result = parseAshDocument(document);

            if (result.errors && result.errors.length > 0) {
              logger.info(
                "AshParserService",
                "Grammar parser had errors, falling back to simple parser"
              );
              result = parseAshDocumentSimple(document) as AshParseResult;
            } else {
              logger.debug("AshParserService", "Grammar parser succeeded");
            }
          } catch (grammarError) {
            logger.warn(
              "AshParserService",
              "Grammar parser crashed, using simple parser",
              {
                error:
                  grammarError instanceof Error
                    ? grammarError.message
                    : String(grammarError),
              }
            );
            result = parseAshDocumentSimple(document) as AshParseResult;
          }
        }
      } catch (error) {
        // Ultimate fallback if anything goes wrong
        logger.error(
          "AshParserService",
          "Parser service error, using emergency fallback",
          {
            error: error instanceof Error ? error.message : String(error),
          }
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
