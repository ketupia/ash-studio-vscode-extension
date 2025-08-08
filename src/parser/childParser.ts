import { ChildPattern } from "../types/configurationRegistry";
import { ParsedChild, ParsedLocation } from "../types/parser";

/**
 * ChildParser is responsible for extracting child elements (such as attributes, actions, etc.)
 * from the content of a DSL section in Ash modules. It uses explicit keyword and name patterns
 * defined in configuration to identify and parse children, returning their names and locations.
 *
 * Architectural Notes:
 * - Pure logic: Does not depend on VS Code APIs or external services.
 * - Pattern-driven: Uses configuration-driven keyword and name patterns for robust, maintainable parsing.
 * - Returns ParsedChild objects with keyword, name, and startingLocation (line/column).
 *
 * Example usage:
 *   const children = childParser.findChildren(content, patterns, parentStartLine);
 */
export class ChildParser {
  /**
   * Find all children for the given patterns in the provided content
   *
   * @param lines - The DSL section content as an array of lines
   * @param patterns - Array of keyword patterns to search for
   * @param parentStartLine - Starting line number of parent section for position calculation
   * @returns Array of ParsedChild objects for each child found
   */
  findChildren(
    lines: string[],
    patterns: ChildPattern[],
    parentStartLine: number
  ): ParsedChild[] {
    if (!lines.length || !patterns.length) {
      return [];
    }

    const children: ParsedChild[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      for (const pattern of patterns) {
        const match = this.findPatternInLine(trimmedLine, pattern);
        if (match) {
          const startingLocation: ParsedLocation = {
            line: parentStartLine + i,
            column: line.indexOf(trimmedLine) + 1,
          };
          children.push({
            keyword: pattern.keyword,
            name: match.name,
            startingLocation,
          });
        }
      }
    }

    return children;
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
  ): { name: string } | null {
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
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }
    }

    return {
      name,
    };
  }
}
