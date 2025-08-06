import * as vscode from "vscode";
import { ParsedDataProvider } from "../../parsedDataProvider";
import { ConfigurationManager } from "../../utils/config";

/**
 * Provides CodeLens for Ash DSL files, displaying diagram links.
 * Stateless provider that queries the parser service on demand.
 */
class CodeLensProvider implements vscode.CodeLensProvider {
  // Track disposables for cleanup
  private disposables: vscode.Disposable[] = [];

  constructor(private readonly parsedDataProvider: ParsedDataProvider) {
    // Listen for configuration changes that might affect code lens display
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration("ashStudio.enableCodeLens")) {
          this.triggerCodeLensRefresh();
        }
      })
    );
  }

  /**
   * Provides CodeLens for Ash DSL files
   */
  async provideCodeLenses(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    if (!ConfigurationManager.getInstance().get("enableCodeLens")) {
      return [];
    }

    // Query parser for current document
    const parseResult = this.parsedDataProvider.getParseResult(document);

    // Convert parser results to VS Code CodeLens objects
    const codeLenses: vscode.CodeLens[] = [];
    // Handle diagram code lenses
    for (const entry of parseResult.diagramCodeLenses || []) {
      const line = Math.max(0, entry.line - 1); // Convert to 0-based line number
      const range = new vscode.Range(
        new vscode.Position(line, entry.character),
        new vscode.Position(line, entry.character + 1)
      );
      const lens = new vscode.CodeLens(range);
      if (entry.command === "ash-studio.showDiagram") {
        lens.command = {
          title: entry.title,
          command: entry.command,
          arguments: [document.uri.fsPath, entry],
          tooltip: `View diagram for ${entry.source}`,
        };
      } else {
        vscode.window.showErrorMessage(`Unknown Command ${entry.command}`);
      }
      codeLenses.push(lens);
    }
    // Handle cross-reference code lenses
    for (const entry of parseResult.crossReferenceCodeLenses || []) {
      const line = Math.max(0, entry.line - 1); // Convert to 0-based line number
      const range = new vscode.Range(
        new vscode.Position(line, entry.character),
        new vscode.Position(line, entry.character + 1)
      );
      const lens = new vscode.CodeLens(range);
      lens.command = {
        title: "➡️ " + entry.title,
        command: "ash-studio.gotoFileLocation",
        arguments: [document.uri.fsPath, entry],
        tooltip: `Go to referenced section/detail (line ${entry.targetLine})`,
      };
      codeLenses.push(lens);
    }
    return codeLenses;
  }

  /**
   * Trigger a refresh of all code lenses
   */
  private triggerCodeLensRefresh(): void {
    // This will force VS Code to re-request code lenses
    vscode.commands.executeCommand("vscode.executeCodeLensProvider");
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}

/**
 * Register the CodeLens provider with VS Code
 */
export function registerCodeLensProvider(
  context: vscode.ExtensionContext,
  parsedDataProvider: ParsedDataProvider
): vscode.Disposable {
  const provider = new CodeLensProvider(parsedDataProvider);

  // Register the provider for Elixir files
  const providerDisposable = vscode.languages.registerCodeLensProvider(
    { language: "elixir", scheme: "file" },
    provider
  );

  context.subscriptions.push(providerDisposable);

  return vscode.Disposable.from(providerDisposable);
}
