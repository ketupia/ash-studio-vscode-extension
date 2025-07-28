import * as vscode from "vscode";
import { Parser, ParseResult } from "./parsers/parser";
import { AshParser } from "./parsers/grammarBased/ashParser";
import { SimpleParser } from "./parsers/regexBased/simpleParser";
import { ConfigurationDrivenParser } from "./parsers/configurationDriven/configurationDrivenParser";
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

  // List of parsers to try in order - first one that succeeds wins
  private parsers: Parser[] = [
    ConfigurationDrivenParser.getInstance(),
    AshParser.getInstance(),
    new SimpleParser(),
  ];

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

    // Try parsers in order until one succeeds
    const source = document.getText();
    const logger = Logger.getInstance();
    let result: ParseResult | null = null;

    for (const parser of this.parsers) {
      try {
        const parseResult = parser.parse(source);

        // Consider a parser successful if:
        // 1. It identifies the file as an Ash file, OR
        // 2. It's the last parser (fallback)
        const isLastParser = parser === this.parsers[this.parsers.length - 1];

        if (parseResult.isAshFile || isLastParser) {
          logger.debug(
            "AshParserService",
            `Parser ${parseResult.parserName} succeeded`,
            {
              isAshFile: parseResult.isAshFile,
              sectionsFound: parseResult.sections.length,
              errorsFound: parseResult.errors.length,
              isLastParser,
            }
          );
          result = parseResult;
          break;
        } else {
          logger.debug(
            "AshParserService",
            `Parser ${parseResult.parserName} did not identify file as Ash file, trying next parser`
          );
        }
      } catch (error) {
        logger.warn(
          "AshParserService",
          `Parser failed with error, trying next parser`,
          {
            error: error instanceof Error ? error.message : String(error),
          }
        );
        // Continue to next parser
      }
    }

    // Fallback if no parser succeeded (shouldn't happen with SimpleParser as fallback)
    if (!result) {
      logger.error(
        "AshParserService",
        "All parsers failed, using empty result"
      );
      result = {
        sections: [],
        errors: [],
        isAshFile: false,
        parserName: "EmptyFallback",
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
        errors: [],
        isAshFile: false,
        parserName: "LanguageFilter",
      };
    }

    return this.getParseResult(document);
  }
}
