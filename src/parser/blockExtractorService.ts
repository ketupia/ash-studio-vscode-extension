import { ModuleInterface, DslBlock } from "../types/configurationRegistry";
import { ParsedSection } from "../types/parser";
import { BlockIdentifierService } from "./blockIdentifierService";
import { BlockContentExtractor } from "./blockContentExtractor";
import { SourcePositionCalculator } from "./sourcePositionCalculator";
import { PatternMatcher } from "./patternMatcher";

/**
 * BlockExtractorService - Orchestrates DSL block extraction from Elixir source code
 *
 * This service coordinates the parsing of Ash DSL blocks (like attributes, actions, policies)
 * from Elixir source files. It delegates specific responsibilities to focused services
 * to maintain clean separation of concerns.
 *
 * RESPONSIBILITIES:
 * - Orchestrate the overall extraction process for DSL modules
 * - Build configuration mappings from module definitions
 * - Coordinate between specialized parsing services
 * - Handle the high-level flow of block processing
 * - Ensure blocks are processed in source file order (not configuration order)
 *
 * ARCHITECTURE:
 * Uses dependency injection with focused services:
 * - BlockIdentifierService: Finds block boundaries in source text
 * - BlockContentExtractor: Extracts content from identified blocks
 * - SourcePositionCalculator: Calculates line/column positions for VS Code
 * - ChildBlockParser: Parses nested block structures recursively
 *
 * USAGE:
 * ```typescript
 * const extractor = new BlockExtractorService();
 * const sections = extractor.extractModules(sourceCode, [ashResourceConfig]);
 * // Returns ParsedSection[] with details for each DSL block found
 * ```
 */
export class BlockExtractorService {
  // Dependency injection - each service handles a specific aspect of parsing
  private blockIdentifier = new BlockIdentifierService();
  private contentExtractor = new BlockContentExtractor();
  private positionCalculator = new SourcePositionCalculator();
  private patternMatcher = new PatternMatcher();

  /**
   * Extract DSL modules and their blocks from Elixir source code
   *
   * This is the main entry point that orchestrates the entire parsing process.
   * It finds all relevant DSL blocks, sorts them by their position in the source,
   * and processes each one to extract detailed information.
   *
   * @param source - The Elixir source code to parse
   * @param matchedModules - Module configurations that apply to this file (e.g., Ash.Resource)
   * @returns Array of parsed sections, each containing the block name and its parsed details
   */
  extractModules(
    source: string,
    matchedModules: ModuleInterface[]
  ): ParsedSection[] {
    const blockNameToConfig = this.buildBlockNameMapping(matchedModules);
    const blockNames = Object.keys(blockNameToConfig);

    if (blockNames.length === 0) return [];

    const blockMatches = this.findAndSortBlocks(source, blockNames);
    return this.processBlocks(source, blockMatches, blockNameToConfig);
  }

  /**
   * Build a lookup map from block names to their configurations
   *
   * Creates a mapping from block names (like "attributes", "actions") to their
   * DslBlock configurations, which contain parsing rules and child block definitions.
   */
  private buildBlockNameMapping(
    matchedModules: ModuleInterface[]
  ): Record<string, DslBlock> {
    const blockNameToConfig: Record<string, DslBlock> = {};

    for (const module of matchedModules) {
      for (const dslBlock of module.dslBlocks) {
        blockNameToConfig[dslBlock.blockName] = dslBlock;
      }
    }

    return blockNameToConfig;
  }

  /**
   * Find all blocks in source and sort them by their actual position
   *
   * Locates all DSL blocks matching the given block names and sorts them by
   * their position in the source file. This ensures we process blocks in the
   * order they appear in the file, not the order they're defined in configurations.
   */
  private findAndSortBlocks(
    source: string,
    blockNames: string[]
  ): Array<{ blockName: string; start: number; match: RegExpMatchArray }> {
    const blockMatches = this.blockIdentifier.findAllBlocks(source, blockNames);
    return blockMatches.sort((a, b) => a.start - b.start);
  }

  /**
   * Process each found block to create ParsedSection objects
   *
   * Iterates through all found blocks in source order and processes each one
   * to extract its content and parse any child blocks. Each block becomes a
   * ParsedSection with its raw content and parsed details.
   */
  private processBlocks(
    source: string,
    blockMatches: Array<{
      blockName: string;
      start: number;
      match: RegExpMatchArray;
    }>,
    blockNameToConfig: Record<string, DslBlock>
  ): ParsedSection[] {
    const sections: ParsedSection[] = [];

    for (let i = 0; i < blockMatches.length; i++) {
      const { blockName, start: blockStart, match } = blockMatches[i];
      const dslBlock = blockNameToConfig[blockName];
      const nextBlockStart = this.getNextBlockStart(
        blockMatches,
        i,
        source.length
      );

      const section = this.processBlock(
        source,
        blockStart,
        nextBlockStart,
        dslBlock,
        match
      );

      if (section) {
        sections.push(section);
      }
    }

    return sections;
  }

  /**
   * Get the start position of the next block or end of source
   */
  private getNextBlockStart(
    blockMatches: Array<{
      blockName: string;
      start: number;
      match: RegExpMatchArray;
    }>,
    currentIndex: number,
    sourceLength: number
  ): number {
    return currentIndex + 1 < blockMatches.length
      ? blockMatches[currentIndex + 1].start
      : sourceLength;
  }

  /**
   * Process a single block, handling both complete and incomplete blocks
   */
  private processBlock(
    source: string,
    blockStart: number,
    nextBlockStart: number,
    dslBlock: DslBlock,
    match: RegExpMatchArray
  ): ParsedSection | null {
    const blockEnd = this.blockIdentifier.findEndOfBlock(
      source,
      blockStart,
      nextBlockStart
    );

    if (blockEnd === -1) {
      return this.handleBlockWithoutEnd(
        source,
        blockStart,
        nextBlockStart,
        dslBlock,
        match
      );
    }

    return this.handleCompleteBlock(
      source,
      blockStart,
      blockEnd,
      dslBlock,
      match
    );
  }

  /**
   * Handle blocks where we can't find a proper 'end' keyword
   */
  private handleBlockWithoutEnd(
    source: string,
    blockStart: number,
    nextBlockStart: number,
    dslBlock: DslBlock,
    match: RegExpMatchArray
  ): ParsedSection {
    const blockContent = this.contentExtractor.extractContentToNextBlock(
      source,
      blockStart,
      nextBlockStart
    );

    const name = this.contentExtractor.extractBlockName(
      match,
      undefined // Root blocks don't have name patterns in simplified approach
    );
    const finalContent = this.contentExtractor.prependNameToContent(
      blockContent,
      name
    );

    const details = this.patternMatcher.findPatterns(
      finalContent,
      dslBlock.childPatterns || [],
      this.positionCalculator.getLineNumber(source, blockStart)
    );

    return {
      section: dslBlock.blockName,
      rawContent: finalContent,
      startLine: this.positionCalculator.getLineNumber(source, blockStart),
      endLine: this.positionCalculator.getLineNumber(source, nextBlockStart),
      details,
    };
  }

  /**
   * Handle complete blocks with proper do...end structure
   */
  private handleCompleteBlock(
    source: string,
    blockStart: number,
    blockEnd: number,
    dslBlock: DslBlock,
    match: RegExpMatchArray
  ): ParsedSection {
    const blockContent = this.contentExtractor.extractDoBlockContent(
      source,
      blockStart,
      blockEnd
    );

    const name = this.contentExtractor.extractBlockName(
      match,
      undefined // Root blocks don't have name patterns in simplified approach
    );
    const finalContent = this.contentExtractor.prependNameToContent(
      blockContent,
      name
    );

    const details = this.patternMatcher.findPatterns(
      finalContent,
      dslBlock.childPatterns || [],
      this.positionCalculator.getLineNumber(source, blockStart)
    );

    return {
      section: dslBlock.blockName,
      rawContent: finalContent,
      startLine: this.positionCalculator.getLineNumber(source, blockStart),
      endLine: this.positionCalculator.getLineNumber(source, blockEnd),
      details,
    };
  }
}
