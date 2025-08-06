/**
 * Main configuration-driven parser for Ash DSL blocks.
 *
 * This file contains:
 * - ModuleParser: The core parser implementation using configuration-driven logic.
 * - All parsing logic, configuration management, and helpers for Ash DSL parsing.
 *
 * Usage: Use the exported singleton `moduleParser` for all parsing tasks.
 */

import { DiagramCodeLensEntry, Parser, ParseResult } from "../types/parser";
import registry from "../configurations/registry";
import { UseDeclarationService } from "./useDeclarationService";
import { ModuleMatcherService } from "./moduleMatcherService";
import { BlockExtractorService } from "./blockExtractorService";
import { DiagramCodeLensService } from "./diagramCodeLensService";
import { CrossReferenceCodeLensService } from "./crossReferenceCodeLensService";

/**
 * A Parser implementation that uses ModuleConfiguration configurations
 * to parse Ash DSL blocks in a structured way.
 */
export class ModuleParser implements Parser {
  private static instance: ModuleParser;
  private useDeclarationService: UseDeclarationService;
  private moduleMatcherService: ModuleMatcherService;
  private blockExtractorService: BlockExtractorService;

  private constructor() {
    this.useDeclarationService = new UseDeclarationService();
    this.moduleMatcherService = new ModuleMatcherService();
    this.blockExtractorService = new BlockExtractorService();
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
   * @param filePath The file path of the document (required for diagram code lenses)
   */
  parse(source: string, filePath?: string): ParseResult {
    const availableConfigs = registry.getAll();
    // Pass 1: Find all use declarations
    const useDeclarations =
      this.useDeclarationService.findUseDeclarations(source);
    if (useDeclarations.length === 0) {
      return {
        sections: [],
        parserName: "ModuleParser",
        diagramCodeLenses: [],
        crossReferenceCodeLenses: [],
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
        parserName: "ModuleParser",
        diagramCodeLenses: [],
        crossReferenceCodeLenses: [],
      };
    }
    // Extract DSL modules and their blocks
    const sections = this.blockExtractorService.extractModules(
      source,
      matchedModules
    );
    // Use new code lens services per module config
    let diagramCodeLenses: DiagramCodeLensEntry[] = [];
    for (const module of matchedModules) {
      const diagramLensService = new DiagramCodeLensService(module);
      diagramCodeLenses = diagramCodeLenses.concat(
        diagramLensService.getCodeLenses(sections, filePath)
      );
    }
    // Cross-reference code lenses
    const crossReferenceCodeLensService = new CrossReferenceCodeLensService();
    const crossReferenceCodeLenses =
      crossReferenceCodeLensService.getCrossReferenceCodeLenses(
        sections,
        matchedModules
      );
    return {
      sections,
      parserName: "ModuleParser",
      diagramCodeLenses,
      crossReferenceCodeLenses,
    };
  }
}

export const moduleParser = ModuleParser.getInstance();
