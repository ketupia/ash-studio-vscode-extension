import * as vscode from "vscode";
import { ParsedDataProvider } from "../../parsedDataProvider";
import { Logger } from "../../utils/logger";
import { DefinitionEntry } from "../../types/parser";
/**
 * DefinitionProvider for Ash Framework cross-references.
 * Enables Ctrl+Click (Go to Definition) for cross-referenced sections/details.
 */
export class DefinitionProvider implements vscode.DefinitionProvider {
  /**
   * Provide the definition for the symbol at the given position.
   * @param document The text document.
   * @param position The position in the document.
   * @param _token Cancellation token.
   * @returns Location(s) of the definition, or undefined if not found.
   */
  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    Logger.getInstance().debug(
      "DefinitionProvider",
      `provideDefinition called for ${document.fileName} at line ${position.line + 1}, character ${position.character}`
    );

    const parseResult =
      ParsedDataProvider.getInstance().getParseResult(document);

    const symbol = this.getSymbolUnderCursor(document, position);
    const defEntries = this.findAllMatchingDefinitionEntries(
      parseResult,
      symbol,
      position.line
    );

    if (defEntries.length > 0) {
      return defEntries.map(entry => this.createLocation(document, entry));
    }
    return undefined;
  }

  /**
   * Get the symbol under the cursor at the given position.
   */
  private getSymbolUnderCursor(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string | undefined {
    const wordRange = document.getWordRangeAtPosition(position);
    const symbol = wordRange ? document.getText(wordRange) : undefined;
    Logger.getInstance().debug(
      "DefinitionProvider",
      `Symbol under cursor: ${symbol}`
    );
    return symbol;
  }

  /**
   * Find all matching definition entries for the symbol, including colon normalization.
   */
  private findAllMatchingDefinitionEntries(
    parseResult: { definitionEntries: DefinitionEntry[] },
    symbol: string | undefined,
    currentLine: number
  ): DefinitionEntry[] {
    if (!symbol) {
      Logger.getInstance().debug(
        "DefinitionProvider",
        "No symbol under cursor."
      );
      return [];
    }
    const candidates = [symbol];
    if (symbol.startsWith(":")) {
      candidates.push(symbol.slice(1));
    } else {
      candidates.push(":" + symbol);
    }
    const defEntries = parseResult.definitionEntries.filter(
      entry =>
        candidates.includes(entry.name) &&
        entry.startingLocation.line - 1 !== currentLine
    );
    Logger.getInstance().debug(
      "DefinitionProvider",
      `Found definition entries: ${defEntries.length}`
    );
    return defEntries;
  }

  /**
   * Create a VS Code Location for the given definition entry.
   */
  private createLocation(
    document: vscode.TextDocument,
    defEntry: DefinitionEntry
  ): vscode.Location {
    const targetPos = new vscode.Position(
      defEntry.startingLocation.line - 1,
      defEntry.startingLocation.column - 1
    );
    Logger.getInstance().debug(
      "DefinitionProvider",
      `Creating location for definition at line ${defEntry.startingLocation.line}, character ${defEntry.startingLocation.column}`
    );
    return new vscode.Location(document.uri, targetPos);
  }
}

/**
 * Register the DefinitionProvider with the given context.
 * @param context The extension context.
 */
export function registerDefinitionProvider(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { language: "elixir", scheme: "file" },
      new DefinitionProvider()
    )
  );
}
