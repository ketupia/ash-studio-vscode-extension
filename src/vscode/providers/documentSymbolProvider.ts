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

      const cfg = vscode.workspace.getConfiguration("ashStudio");
      const showChildrenInOutlineAndSymbols = cfg.get<boolean>(
        "showChildrenInOutlineAndSymbols",
        false
      );

      // Return main DSL sections with nested children if config flag is set
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

        const sectionSymbol = new vscode.DocumentSymbol(
          section.name, // Use the actual section name (e.g., "attributes")
          "",
          section.symbol ?? vscode.SymbolKind.Class,
          new vscode.Range(startPos, endPos),
          new vscode.Range(startPos, startPos)
        );

        if (showChildrenInOutlineAndSymbols) {
          const children = getChildrenSymbols(section);
          if (children.length > 0) {
            sectionSymbol.children = children;
          }
        }

        return sectionSymbol;
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

function getChildrenSymbols(section: ParsedSection) {
  return section.children.map(child => {
    const childStartPos = new vscode.Position(
      child.startingLocation.line - 1,
      child.startingLocation.column - 1
    );

    const childEndPos = new vscode.Position(
      child.startingLocation.line - 1,
      child.startingLocation.column +
        (child.name?.length || child.keyword.length) -
        1
    );

    return new vscode.DocumentSymbol(
      child.name || child.keyword,
      child.keyword,
      section.symbol ?? vscode.SymbolKind.Field,
      new vscode.Range(childStartPos, childEndPos),
      new vscode.Range(childStartPos, childStartPos)
    );
  });
}
