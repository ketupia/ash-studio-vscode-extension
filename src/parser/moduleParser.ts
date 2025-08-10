/**
 * Main configuration-driven parser for DSL section.
 *
 * This file contains:
 * - ModuleParser: The core parser implementation using configuration-driven logic.
 * - All parsing logic, configuration management, and helpers for DSL parsing.
 *
 * Usage: Use the exported singleton `moduleParser` for all parsing tasks.
 */

import { Parser, ParseResult } from "../types/parser";
import registry from "../configurations/registry";
import { UseDeclarationService } from "./useDeclarationService";
import { ModuleMatcherService } from "./moduleMatcherService";
import { DefinitionEntryService } from "./definitionEntryService";
import { SectionParser } from "./sectionParser";
import { DiagramCodeLensService } from "./diagramCodeLensService";

/**
 * A Parser implementation that uses ModuleConfiguration configurations
 * to parse DSL sections in a structured way.
 */
export class ModuleParser implements Parser {
  private static instance: ModuleParser;
  private useDeclarationService: UseDeclarationService;
  private moduleMatcherService: ModuleMatcherService;

  private constructor() {
    this.useDeclarationService = new UseDeclarationService();
    this.moduleMatcherService = new ModuleMatcherService();
  }

  static getInstance(): ModuleParser {
    if (!ModuleParser.instance) {
      ModuleParser.instance = new ModuleParser();
    }
    return ModuleParser.instance;
  }

  /**
   * Parses the source code and returns a ParseResult.
   * @param source The source code to parse
   */
  parse(source: string, filePath?: string): ParseResult {
    const availableConfigs = registry.getAll();
    // Pass 1: Find all use declarations
    const useDeclarations =
      this.useDeclarationService.findUseDeclarations(source);
    if (useDeclarations.length === 0) {
      return {
        sections: [],
        diagramCodeLenses: [],
        definitionEntries: [],
      };
    }
    // Identify which modules are present
    const matchedModules = this.moduleMatcherService.identifyConfiguredModules(
      useDeclarations,
      availableConfigs
    );
    if (matchedModules.length === 0) {
      return {
        sections: [],
        diagramCodeLenses: [],
        definitionEntries: [],
      };
    }

    const sections = new SectionParser().parseSections(source, matchedModules);

    // Definition entries
    const definitionEntries = DefinitionEntryService.getDefinitionEntries(
      sections,
      matchedModules
    );

    const diagramCodeLenses = matchedModules
      .map(moduleConfig =>
        new DiagramCodeLensService(moduleConfig).getCodeLenses(
          sections,
          filePath
        )
      )
      .flatMap(diagramCodeLenses => diagramCodeLenses);

    return {
      sections,
      diagramCodeLenses,
      definitionEntries,
    };
  }
}

// Only export the singleton instance, not the static getInstance method
export const moduleParser = ModuleParser.getInstance();
