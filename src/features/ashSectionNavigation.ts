import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";

export function registerAshSectionNavigation(
  context: vscode.ExtensionContext,
  parserService?: AshParserService
) {
  const parser = parserService || AshParserService.getInstance();

  // DocumentSymbolProvider for Ash Resource/Domain files
  const ashSelector: vscode.DocumentSelector = [
    { language: "elixir", pattern: "**/*.ex" },
  ];

  const provider: vscode.DocumentSymbolProvider = {
    provideDocumentSymbols(document, token) {
      // Use cached result if available, otherwise parse
      let parseResult = parser.getCachedResult(document);
      if (!parseResult) {
        parseResult = parser.getParseResult(document);
      }

      if (!parseResult.isAshFile) {
        return [];
      }

      // Return only main DSL sections for breadcrumbs - no nested details
      return parseResult.sections.map((section) => {
        const startPos = new vscode.Position(section.line, section.column);
        const endPos = new vscode.Position(section.endLine, section.endColumn);

        return new vscode.DocumentSymbol(
          section.name,
          section.type,
          vscode.SymbolKind.Class,
          new vscode.Range(startPos, endPos),
          new vscode.Range(startPos, startPos)
        );
      });
    },
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(ashSelector, provider)
  );
}
