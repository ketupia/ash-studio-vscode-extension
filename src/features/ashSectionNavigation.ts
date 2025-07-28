import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { ParsedSection } from "../parsers/parser";

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
      return parseResult.sections.map(section => {
        const startPos = new vscode.Position(section.startLine - 1, 0); // Convert to 0-based
        const endPos = new vscode.Position(section.endLine - 1, 0); // Convert to 0-based

        return new vscode.DocumentSymbol(
          section.section,
          "Section", // Generic type since ParsedSection doesn't have a type field
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
