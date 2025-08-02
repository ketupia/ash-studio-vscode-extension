import { ChildPattern } from "../types/configurationRegistry";
import { ParsedDetail } from "../types/parser";
import { BlockIdentifierService } from "./blockIdentifierService";
import { BlockContentExtractor } from "./blockContentExtractor";
import { SourcePositionCalculator } from "./sourcePositionCalculator";

/**
 * ChildBlockParser - Focused service for parsing nested block structures
 *
 * REFACTORING NOTES:
 * - Extracted the most complex parsing logic from original BlockExtractorService
 * - Originally nested deeply within the main parsing loop, making it hard to test
 * - Now isolated with clear dependencies on other focused services
 * - Handles the recursive nature of Ash DSL blocks (blocks within blocks)
 *
 * RESPONSIBILITIES:
 * - Parse child elements within parent blocks (e.g., attributes within attributes block)
 * - Handle multiple block formats: do...end, single-line, function calls
 * - Recursively parse nested structures
 * - Calculate accurate line/column positions for nested elements
 *
 * BLOCK FORMATS HANDLED:
 * 1. Multi-line do...end: `attribute :name, :type do ... end`
 * 2. Single-line: `attribute :name, :type`
 * 3. Function call: `attribute(:name, :type)`
 */
export class ChildBlockParser {
  // Dependency injection of focused services - follows composition over inheritance
  private blockIdentifier = new BlockIdentifierService();
  private contentExtractor = new BlockContentExtractor();
  private positionCalculator = new SourcePositionCalculator();

  /**
   * Parse child blocks within a parent block's content
   *
   * Main entry point for parsing nested elements. Iterates through each line
   * and attempts to match against configured child block patterns.
   *
   * @param parentContent - The content inside a parent block (e.g., inside "attributes do...end")
   * @param childConfigs - Configuration for expected child blocks (e.g., "attribute" blocks)
   * @param parentStartLine - Starting line number of parent block for position calculation
   */
  parseChildBlocks(
    parentContent: string,
    childConfigs: ChildPattern[],
    parentStartLine: number
  ): ParsedDetail[] {
    if (!parentContent.trim() || !childConfigs.length) {
      return [];
    }

    const details: ParsedDetail[] = [];
    const lines = parentContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      for (const childConfig of childConfigs) {
        const detail = this.tryParseChildBlock(
          line,
          childConfig,
          parentContent,
          parentStartLine + i
        );

        if (detail) {
          details.push(detail);
          // Skip processed lines for multi-line blocks
          if (detail.endLine > detail.line) {
            i += detail.endLine - detail.line;
          }
          break; // Move to next line
        }
      }
    }

    return details;
  }

  /**
   * Try to parse a line as one of the expected child block types
   *
   * This method tries multiple parsing strategies in order:
   * 1. Multi-line do...end blocks (most complex)
   * 2. Single-line blocks (no do...end)
   * 3. Function call syntax blocks
   *
   * Returns the first successful match or null if no patterns match.
   */
  private tryParseChildBlock(
    line: string,
    childConfig: ChildPattern,
    parentContent: string,
    absoluteLineNumber: number
  ): ParsedDetail | null {
    // Try multi-line do...end block pattern
    const doBlockResult = this.tryParseDoBlock(
      line,
      childConfig,
      parentContent,
      absoluteLineNumber
    );
    if (doBlockResult) return doBlockResult;

    // Try single-line block pattern
    const singleLineResult = this.tryParseSingleLineBlock(
      line,
      childConfig,
      parentContent,
      absoluteLineNumber
    );
    if (singleLineResult) return singleLineResult;

    // Try single-line function call pattern
    const functionCallResult = this.tryParseFunctionCallBlock(
      line,
      childConfig,
      parentContent,
      absoluteLineNumber
    );
    if (functionCallResult) return functionCallResult;

    return null;
  }

  private tryParseDoBlock(
    line: string,
    childConfig: ChildPattern,
    parentContent: string,
    absoluteLineNumber: number
  ): ParsedDetail | null {
    const blockPattern = new RegExp(
      `^\\s*(${childConfig.keyword})\\s+(.+?)\\s*$`
    );
    const match = line.match(blockPattern);

    if (!match || !line.trim().endsWith(" do")) {
      return null;
    }

    const nestedBlockStart = parentContent.indexOf(line);
    if (nestedBlockStart === -1) return null;

    const nestedBlockEnd = this.blockIdentifier.findEndOfBlock(
      parentContent,
      nestedBlockStart
    );
    if (nestedBlockEnd === -1) return null;

    const fullNestedBlock = parentContent.substring(
      nestedBlockStart,
      nestedBlockEnd
    );

    const name = this.extractName(line, childConfig);
    const rawContent = this.extractRawContent(line, childConfig.keyword);

    // No nested children in simplified approach
    const childDetails: ParsedDetail[] = [];

    return {
      section: parentContent,
      detail: childConfig.keyword,
      name,
      rawContent,
      line: absoluteLineNumber,
      column: 1,
      endLine: absoluteLineNumber + fullNestedBlock.split("\n").length - 1,
      childDetails,
    };
  }

  private tryParseSingleLineBlock(
    line: string,
    childConfig: ChildPattern,
    parentContent: string,
    absoluteLineNumber: number
  ): ParsedDetail | null {
    const blockPattern = new RegExp(
      `^\\s*(${childConfig.keyword})\\s+(.+?)\\s*$`
    );
    const match = line.match(blockPattern);

    if (!match || line.trim().endsWith(" do")) {
      return null;
    }

    const name = this.extractName(line, childConfig);
    const rawContent = match[2].trim();

    return {
      section: parentContent,
      detail: childConfig.keyword,
      name,
      rawContent,
      line: absoluteLineNumber,
      column: 1,
      endLine: absoluteLineNumber,
      childDetails: [],
    };
  }

  private tryParseFunctionCallBlock(
    line: string,
    childConfig: ChildPattern,
    parentContent: string,
    absoluteLineNumber: number
  ): ParsedDetail | null {
    const singleLinePattern = new RegExp(
      `^\\s*${childConfig.keyword}\\((.+)\\)\\s*$`
    );
    const match = line.match(singleLinePattern);

    if (!match) return null;

    const name = this.extractNameFromContent(match[1], childConfig.namePattern);
    const rawContent = match[1].trim();

    return {
      section: parentContent,
      detail: childConfig.keyword,
      name,
      rawContent,
      line: absoluteLineNumber,
      column: 1,
      endLine: absoluteLineNumber,
      childDetails: [],
    };
  }

  private extractName(line: string, childConfig: ChildPattern): string {
    if (!childConfig.namePattern) return "";

    const contentBeforeDo = line.trim().endsWith(" do")
      ? line.substring(0, line.lastIndexOf(" do")).trim()
      : line.trim();

    const blockNameLength = childConfig.keyword.length;
    const nameText = contentBeforeDo.substring(blockNameLength).trim();

    return this.extractNameFromContent(nameText, childConfig.namePattern);
  }

  private extractNameFromContent(
    content: string,
    namePattern?: string
  ): string {
    if (!namePattern) return "";

    const nameMatch = content.match(new RegExp(namePattern));
    return nameMatch && nameMatch[1] ? nameMatch[1].trim() : "";
  }

  private extractRawContent(line: string, blockName: string): string {
    const contentBeforeDo = line.trim().endsWith(" do")
      ? line.substring(0, line.lastIndexOf(" do")).trim()
      : line.trim();

    return contentBeforeDo.substring(blockName.length).trim();
  }
}
