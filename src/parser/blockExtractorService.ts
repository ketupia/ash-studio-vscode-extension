import { ModuleInterface, DslBlock } from "../types/configurationRegistry";
import { ParsedSection, ParsedDetail } from "../types/parser";

/**
 * Service for extracting DSL modules and their blocks from source code.
 */
export class BlockExtractorService {
  extractModules(
    source: string,
    matchedModules: ModuleInterface[]
  ): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const lines = source.split("\n");
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();
      if (!line) continue;
      for (const module of matchedModules) {
        for (const dslBlock of module.dslBlocks) {
          const blockPattern = new RegExp(
            `^\\s*(${dslBlock.blockName})\\s*(?:(.+?)\\s+)?do\\s*$`
          );
          const match = line.match(blockPattern);
          if (match) {
            const blockStart = source.indexOf(line, 0);
            if (blockStart === -1) continue;
            const blockEnd = this.findEndOfBlock(source, blockStart);
            if (blockEnd === -1) continue;
            const fullBlockText = source.substring(blockStart, blockEnd);
            const blockContentStart = fullBlockText.indexOf("do") + 2;
            let blockContent = fullBlockText
              .substring(blockContentStart, fullBlockText.length - 3)
              .trim();
            let blockName = "";
            if (dslBlock.namePattern) {
              const nameMatch = match[2].match(
                new RegExp(dslBlock.namePattern)
              );
              if (nameMatch && nameMatch[1]) {
                blockName = nameMatch[1].trim();
                blockContent = `name: ${blockName}\n${blockContent}`;
              }
            }
            const details = this.parseChildBlocks(
              blockContent,
              dslBlock.children || [],
              matchedModules,
              lineIndex + 1
            );
            const section: ParsedSection = {
              section: dslBlock.blockName,
              rawContent: blockContent,
              startLine: lineIndex + 1,
              endLine: lineIndex + 1 + fullBlockText.split("\n").length - 1,
              details,
            };
            sections.push(section);
            lineIndex += fullBlockText.split("\n").length - 1;
            break;
          }
        }
      }
    }
    return sections;
  }

  private parseChildBlocks(
    parentContent: string,
    childConfigs: DslBlock[],
    allModules: ModuleInterface[],
    parentStartLine: number
  ): ParsedDetail[] {
    if (!parentContent.trim()) {
      return [];
    }
    const details: ParsedDetail[] = [];
    const lines = parentContent.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      for (const childConfig of childConfigs) {
        const blockPattern = new RegExp(
          `^\\s*(${childConfig.blockName})\\s+(.+?)\\s*$`
        );
        const match = line.match(blockPattern);
        if (match) {
          const isDoBlock = line.trim().endsWith(" do");
          if (isDoBlock) {
            const nestedBlockStart = parentContent.indexOf(line);
            if (nestedBlockStart === -1) continue;
            const nestedBlockEnd = this.findEndOfBlock(
              parentContent,
              nestedBlockStart
            );
            if (nestedBlockEnd === -1) continue;
            const fullNestedBlock = parentContent.substring(
              nestedBlockStart,
              nestedBlockEnd
            );
            const nestedBlockContentStart = fullNestedBlock.indexOf("do") + 2;
            const nestedBlockContent = fullNestedBlock
              .substring(nestedBlockContentStart, fullNestedBlock.length - 3)
              .trim();
            let name = "";
            const contentBeforeDo = line
              .substring(0, line.lastIndexOf(" do"))
              .trim();
            const blockNameLength = childConfig.blockName.length;
            const nameText = contentBeforeDo.substring(blockNameLength).trim();
            if (childConfig.namePattern) {
              const nameMatch = nameText.match(
                new RegExp(childConfig.namePattern)
              );
              if (nameMatch && nameMatch[1]) {
                name = nameMatch[1].trim();
              }
            }
            let nestedDetails: ParsedDetail[] = [];
            if (childConfig.children && childConfig.children.length > 0) {
              nestedDetails = this.parseChildBlocks(
                nestedBlockContent,
                childConfig.children,
                allModules,
                parentStartLine + i + 1
              );
            }
            const detail: ParsedDetail = {
              section: parentContent,
              detail: childConfig.blockName,
              name,
              rawContent: nameText,
              line: parentStartLine + i,
              column: 1,
              endLine:
                parentStartLine + i + fullNestedBlock.split("\n").length - 1,
              childDetails: nestedDetails,
            };
            details.push(detail);
            const linesInBlock = fullNestedBlock.split("\n").length - 1;
            i += linesInBlock;
            break;
          } else {
            let name = "";
            const content = match[2].trim();
            if (childConfig.namePattern) {
              const nameMatch = content.match(
                new RegExp(childConfig.namePattern)
              );
              if (nameMatch && nameMatch[1]) {
                name = nameMatch[1].trim();
              }
            }
            const detail: ParsedDetail = {
              section: parentContent,
              detail: childConfig.blockName,
              name,
              rawContent: content,
              line: parentStartLine + i,
              column: 1,
              endLine: parentStartLine + i,
              childDetails: [],
            };
            details.push(detail);
            break;
          }
        }
      }
    }
    return details;
  }

  private findEndOfBlock(source: string, startPos: number): number {
    const blockStart = source.indexOf("do", startPos);
    if (blockStart === -1) return source.length;
    let pos = blockStart + 2;
    while (pos < source.length && /\s/.test(source.charAt(pos))) {
      pos++;
    }
    let nestLevel = 1;
    let inString = false;
    let stringDelimiter = "";
    let escaped = false;
    while (nestLevel > 0 && pos < source.length) {
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
          (pos + 3 === source.length || /[\s;.]/.test(source.charAt(pos + 3)))
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
    return pos;
  }
}
