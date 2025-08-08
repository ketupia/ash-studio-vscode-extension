import {
  DslSection,
  ModuleConfiguration,
} from "../types/configurationRegistry";
import { ParsedSection } from "../types/parser";
import { ChildParser } from "./childParser";

/**
 * SectionParser identifies top-level DSL sections in Elixir source code by finding lines
 * matching <name> do for each configured DSL section. It returns ParsedSection objects
 * with section name, raw content, and location info.
 */
export class SectionParser {
  /**
   * Parse all top-level DSL sections in the source code.
   *
   * @param source - The Elixir source code to parse
   * @param matchedModules - Module configurations that apply to this file
   * @returns Array of ParsedSection objects
   */
  parseSections(
    source: string,
    matchedModules: ModuleConfiguration[]
  ): ParsedSection[] {
    const lines = source.split("\n");

    const matchedSections = this.findSectionStartingLocations(
      lines,
      matchedModules
    );
    const parsedSections = matchedSections.map(pair => pair.parsedSection);

    this.setMaximumEndLocations(
      parsedSections,
      lines.length,
      lines[lines.length - 1].length
    );

    this.findActualSectionEnds(lines, parsedSections);

    this.parseSectionChildren(lines, matchedSections);

    return parsedSections;
  }

  private findSectionStartingLocations(
    lines: string[],
    matchedModules: ModuleConfiguration[]
  ): Array<{ sectionConfig: DslSection; parsedSection: ParsedSection }> {
    const result: Array<{
      sectionConfig: DslSection;
      parsedSection: ParsedSection;
    }> = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const moduleConfig of matchedModules) {
        for (const dslSection of moduleConfig.dslSections) {
          const sectionName = dslSection.name;
          // Match: sectionName do (not sectionName do:)
          const regex = new RegExp(`^\\s*${sectionName}\\s+do\\b(?!:)`);
          if (regex.test(line)) {
            const column = line.indexOf(sectionName) + 1;
            result.push({
              sectionConfig: dslSection,
              parsedSection: {
                name: sectionName,
                startingLocation: { line: i + 1, column },
                endingLocation: { line: 0, column: 0 },
                children: [],
              },
            });
            break; // Only one section per line
          }
        }
      }
    }
    return result;
  }

  private setMaximumEndLocations(
    parsedSections: ParsedSection[],
    lineCount: number,
    lastLineLength: number
  ): void {
    for (let i = 0; i < parsedSections.length - 1; i++) {
      const nextStart = parsedSections[i + 1].startingLocation;
      parsedSections[i].endingLocation = {
        line: nextStart.line,
        column: Math.max(nextStart.column - 1, 1),
      };
    }
    if (parsedSections.length > 0) {
      parsedSections[parsedSections.length - 1].endingLocation = {
        line: lineCount,
        column: lastLineLength,
      };
    }
  }

  private findActualSectionEnds(
    lines: string[],
    parsedSections: ParsedSection[]
  ): void {
    parsedSections.map(section => {
      this.findSectionEnd(lines, section);
    });
  }

  private findSectionEnd(lines: string[], parsedSection: ParsedSection) {
    let doCount = 0;
    let endCount = 0;
    const startIdx = parsedSection.startingLocation.line - 1;
    const endIdx = parsedSection.endingLocation.line - 1;

    for (let i = startIdx; i <= endIdx; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("#")) {
        // Skip comment lines
        continue;
      }
      // Count block-style 'do' (not 'do:')
      doCount += (line.match(/(^|[^:])\bdo\b(?!:)/g) || []).length;
      // Detect start of multiline fn block
      if (line.match(/\bfn\b/) && line.match(/->/) && !line.match(/end/)) {
        doCount++;
      }
      const singleLineFnEndMatches = line.match(/\bfn\b.*->.*end/g) || [];
      const ends = (line.match(/\bend\b/g) || []).length;
      endCount += ends - singleLineFnEndMatches.length;
      if (doCount > 0 && doCount === endCount) {
        const endMatch = line.lastIndexOf("end");
        parsedSection.endingLocation = {
          line: i + 1,
          column: endMatch + 4,
        };
        return;
      }
    }
  }

  private parseSectionChildren(
    lines: string[],
    matchedSections: {
      sectionConfig: DslSection;
      parsedSection: ParsedSection;
    }[]
  ): void {
    for (const { sectionConfig, parsedSection } of matchedSections) {
      if (!sectionConfig.childPatterns) {
        continue; // No child patterns defined for this section
      }
      const startLine = parsedSection.startingLocation.line;
      const endLine = parsedSection.endingLocation.line - 1;
      const sectionLines = lines.slice(startLine, endLine);
      parsedSection.children = new ChildParser().findChildren(
        sectionLines,
        sectionConfig.childPatterns,
        startLine + 1 // Adjust for 1-based line numbers
      );
    }
  }
}
