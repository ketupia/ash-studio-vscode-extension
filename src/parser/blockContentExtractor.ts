/**
 * BlockContentExtractor - Focused service for content extraction
 *
 * REFACTORING NOTES:
 * - Extracted from original BlockExtractorService to follow Single Responsibility Principle
 * - Handles only content extraction concerns, not block identification or parsing
 * - Makes the code more testable by isolating content extraction logic
 * - Reduces complexity in the main extraction service
 *
 * RESPONSIBILITIES:
 * - Extract inner content from do...end blocks
 * - Extract content up to block boundaries
 * - Extract block names using name patterns
 * - Format content with extracted names
 */
export class BlockContentExtractor {
  /**
   * Extract the inner content of a do...end block
   *
   * This method handles the common pattern of:
   * ```elixir
   * block_name do
   *   content here
   * end
   * ```
   */
  extractDoBlockContent(
    source: string,
    blockStart: number,
    blockEnd: number
  ): string {
    const fullBlockText = source.substring(blockStart, blockEnd);
    const doIndex = fullBlockText.indexOf("do");
    if (doIndex === -1) return "";

    const contentStart = doIndex + 2;
    const contentEnd = fullBlockText.endsWith("end")
      ? fullBlockText.length - 3
      : fullBlockText.length;

    const rawContent = fullBlockText.substring(contentStart, contentEnd);

    // Remove leading and trailing newlines, but preserve internal structure
    return rawContent.replace(/^\n/, "").replace(/\n$/, "");
  }

  /**
   * Extract the content up to the next block or end of source
   *
   * Used when we can't find a proper 'end' for a block - extracts content
   * up to where the next block starts or end of file.
   */
  extractContentToNextBlock(
    source: string,
    blockStart: number,
    nextBlockStart: number
  ): string {
    const fullBlockText = source.substring(blockStart, nextBlockStart);
    const doIndex = fullBlockText.indexOf("do");
    if (doIndex === -1) return "";

    const contentStart = doIndex + 2;
    const rawContent = fullBlockText.substring(contentStart);

    // Remove leading and trailing newlines, but preserve internal structure
    return rawContent.replace(/^\n/, "").replace(/\n$/, "");
  }

  /**
   * Extract name from block header using the provided name pattern
   *
   * Many Ash blocks have names like "create :user" or "attribute :name"
   * This extracts the name part using regex patterns defined in configurations.
   */
  extractBlockName(
    matchGroups: RegExpMatchArray,
    namePattern: string | undefined
  ): string {
    if (!namePattern || !matchGroups[2]) return "";

    const nameMatch = matchGroups[2].match(new RegExp(namePattern));
    return nameMatch && nameMatch[1] ? nameMatch[1].trim() : "";
  }

  /**
   * Prepend name to content if a name was extracted
   *
   * This creates a consistent format where the extracted name is added
   * as "name: {extracted_name}" at the start of the content for easier parsing.
   */
  prependNameToContent(content: string, name: string): string {
    return name ? `name: ${name}\n${content}` : content;
  }
}
