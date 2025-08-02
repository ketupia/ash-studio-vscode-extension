// Centralized Ash parser types and interfaces for use across the extension
// Only export public APIs. Document each interface/type clearly.

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
  /** Child details for nested structures (recursive) */
  childDetails?: ParsedDetail[];
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

export interface CodeLensEntry {
  /** The line number where this code lens should appear (1-based) */
  line: number;
  /** The character position where this code lens should appear (0-based) */
  character: number;
  /** The title/label to display in the code lens */
  title: string;
  /** The command to execute when the code lens is clicked */
  command: string;
  /** The URL or data to pass as an argument to the command */
  target: string;
  /** The source of this code lens (module name, block type, etc.) */
  source: string;
  /** The range of text this code lens applies to (start and end lines, 1-based) */
  range?: { startLine: number; endLine: number };
}

export interface ParseResult {
  sections: ParsedSection[];
  moduleName?: string; // extracted module name if available
  parserName: string; // name of the parser that was used
  codeLenses: CodeLensEntry[]; // code lens entries to display in the editor
}

export interface Parser {
  /**
   * Parse Ash DSL content from raw text
   * @param source - The source code to parse
   * @param filePath - The file path of the document (required for diagram CodeLenses)
   * @returns ParseResult with sections, details, and any errors
   */
  parse(source: string, filePath?: string): ParseResult;
}

export interface ICodeLensService {
  getCodeLenses(sections: ParsedSection[], filePath?: string): CodeLensEntry[];
}
