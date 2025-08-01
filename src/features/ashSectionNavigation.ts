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

  // Cache the latest parse result
  let latestParseResult: ReturnType<typeof parser.documentActivated> | null =
    null;
  parser.onDidParse(result => {
    latestParseResult = result;
  });

  const provider: vscode.DocumentSymbolProvider = {
    provideDocumentSymbols() {
      if (!latestParseResult) {
        return [];
      }
      // Return only main DSL sections for breadcrumbs - no nested details
      return latestParseResult.sections.map(section => {
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

  // Listen for parse events to re-register the DocumentSymbolProvider
  parser.onDidParse(() => {
    context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(ashSelector, provider)
    );
  });
}
