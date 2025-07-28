import { Parser, ParseResult, ParsedSection } from "../parser";
import { analyzeElixirFile } from "./moduleParser";
import { getAllAvailableConfigurations } from "./moduleParser";

/**
 * Configuration-driven parser that uses ModuleInterface configurations
 * to parse Ash DSL blocks in a structured way
 */
export class ConfigurationDrivenParser implements Parser {
  private static instance: ConfigurationDrivenParser;

  static getInstance(): ConfigurationDrivenParser {
    if (!ConfigurationDrivenParser.instance) {
      ConfigurationDrivenParser.instance = new ConfigurationDrivenParser();
    }
    return ConfigurationDrivenParser.instance;
  }

  /**
   * Parse Ash DSL content using configuration-driven approach
   */
  parse(source: string): ParseResult {
    if (!this.isAshFile(source)) {
      return {
        sections: [],
        errors: [],
        isAshFile: false,
        parserName: "ConfigurationDrivenParser",
      };
    }

    try {
      // Use the existing analyzeElixirFile function
      const analysisResult = analyzeElixirFile(source);

      // Convert from old interface to new unified interface
      const sections: ParsedSection[] = analysisResult.parsedSections.map(
        oldSection => ({
          section: oldSection.section,
          details: oldSection.details.map(oldDetail => ({
            section: oldDetail.section,
            detail: oldDetail.detail,
            name: oldDetail.name,
            line: oldDetail.line,
            column: oldDetail.column,
            endLine: oldDetail.endLine,
            rawContent: undefined, // Not provided by current implementation
            properties: undefined, // Not provided by current implementation
          })),
          startLine: oldSection.startLine,
          endLine: oldSection.endLine,
          rawContent: undefined, // Not provided by current implementation
        })
      );

      return {
        sections,
        errors: [], // Configuration parser doesn't currently provide errors
        isAshFile: true,
        parserName: "ConfigurationDrivenParser",
      };
    } catch (error) {
      return {
        sections: [],
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
            line: 1,
            column: 1,
            offset: 0,
          },
        ],
        isAshFile: true,
        parserName: "ConfigurationDrivenParser",
      };
    }
  }

  /**
   * Check if source appears to be an Ash file
   */
  isAshFile(source: string): boolean {
    // Use the same logic as moduleParser - check if any configurations match
    const configurations = getAllAvailableConfigurations();

    for (const config of configurations) {
      const declarationRegex = new RegExp(config.declarationPattern);
      if (declarationRegex.test(source)) {
        return true;
      }
    }

    return false;
  }
}
