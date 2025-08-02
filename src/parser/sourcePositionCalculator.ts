/**
 * SourcePositionCalculator - Focused service for position calculations
 *
 * RESPONSIBILITIES:
 * - Convert string indices to line numbers (1-based for editors)
 * - Convert string indices to column numbers (1-based for editors)
 * - Calculate both line and column in one call
 * - Count lines in text blocks
 *
 * VS Code and most editors use 1-based line numbers, so we follow that convention.
 */
export class SourcePositionCalculator {
  /**
   * Calculate the line number for a given position in source text (1-based)
   *
   * Counts newline characters before the position to determine line number.
   * Returns 1-based line numbers as expected by VS Code APIs.
   */
  getLineNumber(source: string, position: number): number {
    return source.substring(0, position).split("\n").length;
  }

  /**
   * Calculate the line number for a block start position (1-based)
   *
   * Handles positions from regex matches that may include newline characters
   * at the beginning of the match. This is specifically for block start positions
   * where the regex anchor ^ may have matched the newline at the end of the previous line.
   */
  getBlockStartLineNumber(source: string, position: number): number {
    // If the position points to a newline character, it likely means
    // a regex with ^ anchor matched the newline at the end of the previous line.
    // Adjust by moving to the next character to get the correct line number.
    const adjustedPosition =
      source.charAt(position) === "\n" ? position + 1 : position;
    return source.substring(0, adjustedPosition).split("\n").length;
  }

  /**
   * Calculate the line number for a block end position (1-based)
   *
   * Uses standard position calculation for end positions that point to
   * actual content boundaries (like after an 'end' keyword).
   */
  getBlockEndLineNumber(source: string, position: number): number {
    return this.getLineNumber(source, position);
  }

  /**
   * Calculate the column number for a given position in source text (1-based)
   *
   * Finds the distance from the last newline to determine column position.
   * Returns 1-based column numbers as expected by VS Code APIs.
   */
  getColumnNumber(source: string, position: number): number {
    const beforePosition = source.substring(0, position);
    const lastNewlineIndex = beforePosition.lastIndexOf("\n");
    return lastNewlineIndex === -1 ? position + 1 : position - lastNewlineIndex;
  }

  /**
   * Calculate both line and column for a position
   */
  getPosition(
    source: string,
    position: number
  ): { line: number; column: number } {
    return {
      line: this.getLineNumber(source, position),
      column: this.getColumnNumber(source, position),
    };
  }

  /**
   * Calculate the end line number given start position and content length
   */
  getEndLineNumber(
    source: string,
    startPosition: number,
    endPosition: number
  ): number {
    return this.getLineNumber(source, endPosition);
  }

  /**
   * Count the number of lines in a text block
   */
  countLines(text: string): number {
    return text.split("\n").length;
  }
}
