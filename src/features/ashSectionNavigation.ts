import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { ParsedSection } from "../types/parser";
import { Logger } from "../utils/logger";

/**
 * Registers a single Ash Studio DocumentSymbolProvider for Elixir files.
 * The provider uses cached parse results when available, ensuring fresh symbols for each document.
 */
export function registerAshSectionNavigation(
  context: vscode.ExtensionContext,
  parserService?: AshParserService
) {
  const parser = parserService || AshParserService.getInstance();

  // DocumentSelector for Elixir files
  const ashSelector: vscode.DocumentSelector = [
    { language: "elixir", pattern: "**/*.ex" },
  ];

  const provider: vscode.DocumentSymbolProvider = {
    provideDocumentSymbols(document: vscode.TextDocument) {
      const logger = Logger.getInstance();
      logger.debug(
        "DocumentSymbolProvider",
        `Providing symbols for ${document.fileName}`
      );

      // Try to get cached result first
      let parseResult = parser.getCachedResult(document);

      // If no cached result, parse the document
      if (!parseResult) {
        logger.debug(
          "DocumentSymbolProvider",
          "No cached result, parsing document"
        );
        parseResult = parser.parseElixirDocument(document);
      } else {
        logger.debug("DocumentSymbolProvider", "Using cached result");
      }

      if (!parseResult || parseResult.sections.length === 0) {
        logger.debug(
          "DocumentSymbolProvider",
          "No sections found, returning empty array"
        );
        return [];
      }

      logger.debug(
        "DocumentSymbolProvider",
        `Found ${parseResult.sections.length} sections: ${parseResult.sections.map(s => s.section).join(", ")}`
      );

      // Return only main DSL sections for breadcrumbs - no nested details
      const symbols = parseResult.sections.map((section: ParsedSection) => {
        const startPos = new vscode.Position(section.startLine - 1, 0); // Convert to 0-based
        const endPos = new vscode.Position(section.endLine - 1, 0); // Convert to 0-based
        return new vscode.DocumentSymbol(
          section.section, // Use the actual section name (e.g., "attributes")
          "",
          vscode.SymbolKind.Class,
          new vscode.Range(startPos, endPos),
          new vscode.Range(startPos, startPos)
        );
      });

      logger.debug(
        "DocumentSymbolProvider",
        `Returning ${symbols.length} symbols`
      );
      return symbols;
    },
  };

  // Register the provider
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(ashSelector, provider)
  );
}
