import * as vscode from "vscode";
import { ParsedDataProvider } from "../../parsedDataProvider";
import { ParsedSection } from "../../types/parser";
import { Logger } from "../../utils/logger";

/**
 * Registers a single Ash Studio DocumentSymbolProvider for Elixir files.
 * This provider allows users to navigate Ash DSL sections using the breadcrumbs feature.
 */
export function registerDocumentSymbolProvider(
  context: vscode.ExtensionContext,
  parsedDataProvider: ParsedDataProvider
) {
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

      const parseResult = parsedDataProvider.getParseResult(document);

      logger.debug(
        "DocumentSymbolProvider",
        `Found ${parseResult.sections.length} sections: ${parseResult.sections.map(s => s.name).join(", ")}`
      );

      // Return only main DSL sections for breadcrumbs - no nested details
      const symbols = parseResult.sections.map((section: ParsedSection) => {
        const startPos = new vscode.Position(
          section.startingLocation.line - 1,
          section.startingLocation.column - 1
        ); // Convert to 0-based
        // Use the actual section ending location for end position
        const endPos = new vscode.Position(
          section.endingLocation.line - 1,
          section.endingLocation.column - 1
        ); // Convert to 0-based
        return new vscode.DocumentSymbol(
          section.name, // Use the actual section name (e.g., "attributes")
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
