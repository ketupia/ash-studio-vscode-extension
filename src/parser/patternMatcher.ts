import { ChildPattern } from "../types/configurationRegistry";
import { ParsedDetail } from "../types/parser";

/**
 * PatternMatcher - Simple service for finding keyword patterns in DSL content
 *
 * SIMPLIFIED APPROACH:
 * Instead of complex hierarchical parsing, this service uses simple pattern matching
 * to find specific keywords and optionally extract names/identifiers from them.
 *
 * RESPONSIBILITIES:
 * - Search for keyword patterns in DSL block content
 * - Extract names/identifiers using regex patterns
 * - Calculate line positions for matches
 * - Handle all DSL syntactic forms with simple text matching
 *
 * PATTERN MATCHING LOGIC:
 * ```elixir
 * # In content like:
 * attribute :name, :string do
 *   allow_nil?(false)
 * end
 * attribute :age, :integer
 *
 * # Searches for pattern { keyword: "attribute", namePattern: "(:\w+)" }
 * # Finds: ":name" and ":age"
 * ```
 *
 * This replaces the complex ChildBlockParser with a much simpler approach.
 */
export class PatternMatcher {
  /**
   * Find all matches for the given patterns in the provided content
   *
   * @param content - The DSL block content to search within
   * @param patterns - Array of keyword patterns to search for
   * @param parentStartLine - Starting line number of parent block for position calculation
   * @returns Array of ParsedDetail objects for each match found
   */
  findPatterns(
    content: string,
    patterns: ChildPattern[],
    parentStartLine: number
  ): ParsedDetail[] {
    if (!content.trim() || !patterns.length) {
      return [];
    }

    const details: ParsedDetail[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      for (const pattern of patterns) {
        const match = this.findPatternInLine(trimmedLine, pattern);
        if (match) {
          details.push({
            section: content,
            detail: pattern.keyword,
            name: match.name,
            rawContent: match.content,
            line: parentStartLine + i,
            column: line.indexOf(trimmedLine) + 1,
            endLine: parentStartLine + i,
            childDetails: [], // Simplified - no nested parsing
          });
        }
      }
    }

    return details;
  }

  /**
   * Check if a line matches a specific pattern and extract relevant information
   *
   * @param line - The line to check
   * @param pattern - The pattern to match against
   * @returns Match information if found, null otherwise
   */
  private findPatternInLine(
    line: string,
    pattern: ChildPattern
  ): { name: string; content: string } | null {
    // Simple keyword matching - check if line starts with the keyword
    if (!line.startsWith(pattern.keyword)) {
      return null;
    }

    // Extract the content (everything after the keyword)
    const content = line.substring(pattern.keyword.length).trim();

    // Extract name if pattern is provided
    let name = "";
    if (pattern.namePattern && content) {
      const nameMatch = content.match(new RegExp(pattern.namePattern));
      name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : "";
    }

    return {
      name,
      content: content || line, // Fallback to full line if no content after keyword
    };
  }
}
