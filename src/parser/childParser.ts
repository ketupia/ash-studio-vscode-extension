import { ChildPattern } from "../types/configurationRegistry";
import { ParsedChild, ParsedLocation } from "../types/parser";
import { findPatternInLine } from "../utils/childPatternUtils";

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
        const match = findPatternInLine(pattern, trimmedLine);

        if (match) {
          const startingLocation: ParsedLocation = {
            line: parentStartLine + i + 1,
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
}
