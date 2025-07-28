import * as vscode from "vscode";

/**
 * Unified interfaces for all Ash DSL parsers
 * All parsers should implement these interfaces for consistency
 */

export interface ParseError {
  message: string;
  line: number; // 1-based line number
  column: number; // 1-based column number
  offset: number; // character offset in source
}

export interface ParsedDetail {
  section: string; // parent section name
  detail: string; // detail type (e.g., "attribute", "action")
  name?: string; // detail name if available
  /** Line number where this detail starts (1-based) */
  line: number;
  /** Column where this detail starts (1-based) */
  column: number;
  /** Line number where this detail ends (1-based) */
  endLine: number;
  /** Raw content of the detail */
  rawContent?: string;
  /** Additional properties parsed from the detail */
  properties?: Map<string, unknown>;
}

export interface ParsedSection {
  section: string; // section name (e.g., "attributes", "actions")
  details: ParsedDetail[]; // parsed details within this section
  /** Line number where this section starts (1-based) */
  startLine: number;
  /** Line number where this section ends (1-based) */
  endLine: number;
  /** Raw content of the entire section */
  rawContent?: string;
}

export interface ParseResult {
  sections: ParsedSection[];
  errors: ParseError[];
  isAshFile: boolean; // whether this appears to be an Ash Resource/Domain file
  moduleName?: string; // extracted module name if available
  parserName: string; // name of the parser that was used
}

/**
 * Base interface that all Ash parsers must implement
 */
export interface Parser {
  /**
   * Parse Ash DSL content from raw text
   * @param source - The source code to parse
   * @returns ParseResult with sections, details, and any errors
   */
  parse(source: string): ParseResult;
}
