/**
 * BlockContentExtractor - Focused service for content extraction
 *
 * REFACTORING NOTES:
 * - Extracted from original BlockExtractorService to follow Single Responsibility Principle
 * - Handles only content extraction concerns, not block identification or parsing
 * - Makes the code more testable by isolating content extraction logic
 * - Reduces complexity in the main extraction service
 * - Unified extractDoBlockContent and extractContentToNextBlock into a single method
 *
 * RESPONSIBILITIES:
 * - Extract inner content from do...end blocks (with or without matching 'end')
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
   *
   * @param source - The source code text
   * @param blockStart - Start position of the block
   * @param blockEnd - End position of the block (or next block start if no matching 'end')
   * @param hasMatchingEnd - Whether the blockEnd represents a proper 'end' or just a boundary
   */
  extractDoBlockContent(
    source: string,
    blockStart: number,
    blockEnd: number,
    hasMatchingEnd: boolean = true
  ): string {
    const fullBlockText = source.substring(blockStart, blockEnd);
    const doIndex = fullBlockText.indexOf("do");
    if (doIndex === -1) return "";

    const contentStart = doIndex + 2;

    if (hasMatchingEnd && fullBlockText.endsWith("end")) {
      // Extract content between 'do' and 'end'
      const contentEnd = fullBlockText.length - 3;
      return fullBlockText.substring(contentStart, contentEnd);
    } else {
      // Extract content from 'do' to end of block text (no matching 'end' found)
      return fullBlockText.substring(contentStart);
    }
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
