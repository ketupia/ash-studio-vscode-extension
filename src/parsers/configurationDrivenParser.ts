import { Parser, ParseResult } from "./parser";
import { moduleParser, getAllAvailableConfigurations } from "./moduleParser";

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
        codeLenses: [],
      };
    }

    try {
      // Delegate to the ModuleParser implementation
      const result = moduleParser.parse(source);

      // Just update the parser name to maintain identity
      result.parserName = "ConfigurationDrivenParser";

      return result;
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
        codeLenses: [],
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
