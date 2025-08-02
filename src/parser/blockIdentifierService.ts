/**
 * Service for identifying the boundaries of Elixir do...end blocks.
 * Returns the end index of the block, or -1 if not found.
 */
export class BlockIdentifierService {
  /**
   * Finds the end index of a do...end block in the given source, starting at startPos.
   * If nextBlockStart is provided, will not search past that index.
   */
  findEndOfBlock(
    source: string,
    startPos: number,
    nextBlockStart?: number
  ): number {
    const blockStart = source.indexOf("do", startPos);
    if (blockStart === -1) return -1;
    let pos = blockStart + 2;
    while (pos < source.length && /\s/.test(source.charAt(pos))) {
      pos++;
    }
    let nestLevel = 1;
    let inString = false;
    let stringDelimiter = "";
    let escaped = false;
    while (
      nestLevel > 0 &&
      pos < source.length &&
      (nextBlockStart === undefined || pos < nextBlockStart)
    ) {
      const char = source.charAt(pos);
      if ((char === '"' || char === "'" || char === "`") && !escaped) {
        if (!inString) {
          inString = true;
          stringDelimiter = char;
        } else if (char === stringDelimiter) {
          inString = false;
        }
      }
      escaped = char === "\\" && !escaped;
      if (!inString) {
        if (
          pos + 3 <= source.length &&
          source.substring(pos, pos + 3) === "end" &&
          (pos === 0 || /\s/.test(source.charAt(pos - 1))) &&
          (pos + 3 === source.length || /[\s;.]|$/.test(source.charAt(pos + 3)))
        ) {
          nestLevel--;
          if (nestLevel === 0) {
            return pos + 3;
          }
        } else if (
          pos + 2 <= source.length &&
          source.substring(pos, pos + 2) === "do" &&
          (pos === 0 || /\s/.test(source.charAt(pos - 1))) &&
          (pos + 2 === source.length || /[\s\n]/.test(source.charAt(pos + 2)))
        ) {
          if (
            !(
              pos + 3 < source.length &&
              source.charAt(pos + 2) === " " &&
              source.charAt(pos + 3) === ":"
            )
          ) {
            nestLevel++;
          }
        }
      }
      pos++;
    }
    // If we hit the next block or end of file without closing, return -1
    return -1;
  }

  /**
   * Finds the start index of a block with the given blockName (e.g., 'attributes') in the source, starting from startPos.
   * Returns the index of the start of the line containing the block, or -1 if not found.
   * @param source The source code string
   * @param blockName The block name to search for (e.g., 'attributes')
   * @param startPos The index to start searching from (default 0)
   * @returns The index of the start of the block line, or -1 if not found
   */
  findBlockStart(source: string, blockName: string, startPos = 0): number {
    // Match lines like: attributes do, actions do, etc. (optionally with params)
    const blockPattern = new RegExp(
      `^\\s*${blockName}\\s*(?:.+?\\s+)?do\\s*$`,
      "m"
    );
    // Search line by line for a match
    const lines = source.split("\n");
    let offset = 0;
    for (const line of lines) {
      if (offset >= startPos) {
        if (blockPattern.test(line)) {
          // Return the index in the source string
          return source.indexOf(line, offset);
        }
      }
      offset += line.length + 1; // +1 for the newline
    }
    return -1;
  }

  /**
   * Finds all top-level blocks in the source for the given block names.
   * Returns an array of { blockName, start, match } for each match.
   */
  findAllBlocks(
    source: string,
    blockNames: string[]
  ): Array<{ blockName: string; start: number; match: RegExpMatchArray }> {
    if (!blockNames.length) return [];
    const blockPattern = new RegExp(
      `^\\s*(${blockNames.join("|")})\\s*(?:(.+?)\\s+)?do\\s*$`,
      "gm"
    );
    const results: Array<{
      blockName: string;
      start: number;
      match: RegExpMatchArray;
    }> = [];
    let match;
    while ((match = blockPattern.exec(source)) !== null) {
      results.push({ blockName: match[1], start: match.index, match });
    }
    return results;
  }
}
