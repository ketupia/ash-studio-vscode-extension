/**
 * Main configuration-driven parser for Ash DSL blocks.
 *
 * This file contains:
 * - ModuleParser: The core parser implementation using configuration-driven logic.
 * - All parsing logic, configuration management, and helpers for Ash DSL parsing.
 *
 * Usage: Use the exported singleton `moduleParser` for all parsing tasks.
 */

import { Parser, ParseResult } from "../types/parser";
import { configurationRegistry } from "../configurations/registry";
import { UseDeclarationService } from "./useDeclarationService";
import { ModuleMatcherService } from "./moduleMatcherService";
import { BlockExtractorService } from "./blockExtractorService";
import { DocumentationCodeLensService } from "./documentationCodeLensService";
import { DiagramCodeLensService } from "./diagramCodeLensService";

/**
 * A Parser implementation that uses ModuleInterface configurations
 * to parse Ash DSL blocks in a structured way.
 */
export class ModuleParser implements Parser {
  private static instance: ModuleParser;
  private useDeclarationService: UseDeclarationService;
  private moduleMatcherService: ModuleMatcherService;
  private blockExtractorService: BlockExtractorService;
  private documentationCodeLensService: DocumentationCodeLensService;
  private diagramCodeLensService: DiagramCodeLensService;

  private constructor() {
    this.useDeclarationService = new UseDeclarationService();
    this.moduleMatcherService = new ModuleMatcherService();
    this.blockExtractorService = new BlockExtractorService();
    this.documentationCodeLensService = new DocumentationCodeLensService();
    this.diagramCodeLensService = new DiagramCodeLensService();
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
   * @param filePath The file path of the document (required for diagram CodeLenses)
   */
  parse(source: string, filePath?: string): ParseResult {
    const availableConfigs = configurationRegistry.getAll();
    // Pass 1: Find all use declarations
    const useDeclarations =
      this.useDeclarationService.findUseDeclarations(source);
    if (useDeclarations.length === 0) {
      return {
        sections: [],
        parserName: "ModuleParser",
        codeLenses: [],
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
        codeLenses: [],
      };
    }
    // Extract DSL modules and their blocks
    const sections = this.blockExtractorService.extractModules(
      source,
      matchedModules
    );
    // Extract code lenses for documentation and diagrams (pass filePath)
    const docLenses =
      this.documentationCodeLensService.extractDocumentationLenses(
        source,
        matchedModules
      );
    const diagramLenses = this.diagramCodeLensService.extractDiagramLenses(
      source,
      matchedModules,
      filePath
    );
    const codeLenses = [...docLenses, ...diagramLenses];
    return {
      sections,
      parserName: "ModuleParser",
      codeLenses,
    };
  }
}

export const moduleParser = ModuleParser.getInstance();
