import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { Logger } from "../utils/logger";
import { ConfigurationManager } from "../utils/config";

/**
 * Provides CodeLens for Ash DSL files, displaying diagram links.
 */
export class AshCodeLensProvider implements vscode.CodeLensProvider {
  // Track disposables for cleanup
  private disposables: vscode.Disposable[] = [];

  // Internal code lens list, always reflects the latest parse event
  private codeLenses: vscode.CodeLens[] = [];

  constructor(private readonly parserService: AshParserService) {
    // Listen for parse events to update code lenses and trigger refresh
    this.disposables.push(
      this.parserService.onDidParse(result => {
        this.codeLenses = [];
        for (const entry of result.codeLenses) {
          // Create a range for the CodeLens
          const line = Math.max(0, entry.line - 1); // Convert to 0-based line number
          const range = new vscode.Range(
            new vscode.Position(line, entry.character),
            new vscode.Position(line, entry.character + 1)
          );

          // Create the CodeLens with a command that opens the diagram
          const lens = new vscode.CodeLens(range);

          // Debug logging
          Logger.getInstance().debug(
            "AshCodeLensProvider",
            `Creating code lens: ${entry.title} -> ${entry.target}`
          );

          // Assign command directly from entry
          if (entry.command === "ash-studio.showDiagram") {
            lens.command = {
              title: entry.title,
              command: entry.command,
              arguments: [
                vscode.window.activeTextEditor?.document.uri.fsPath ?? "",
                entry,
              ],
              tooltip: `View diagram for ${entry.source}`,
            };
          } else {
            const logger = Logger.getInstance();
            logger.error(
              "Code Lens Provider",
              `Unknown Command ${entry.command}`
            );
            vscode.window.showErrorMessage(`Unknown Command ${entry.command}`);
          }

          this.codeLenses.push(lens);
        }
        this.triggerCodeLensRefresh();
      })
    );

    // Also listen for configuration changes that might affect code lens display
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
  async provideCodeLenses(): Promise<vscode.CodeLens[]> {
    if (!ConfigurationManager.getInstance().get("enableCodeLens")) {
      return [];
    }
    return this.codeLenses;
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
export function registerAshCodeLensProvider(
  context: vscode.ExtensionContext,
  parserService: AshParserService
): vscode.Disposable {
  const provider = new AshCodeLensProvider(parserService);

  // Register a test command to verify command execution works
  const testCommand = vscode.commands.registerCommand(
    "ash-studio.testCodeLens",
    async (url: string) => {
      console.log(`[CodeLens Test] Test command called with URL: ${url}`);
      vscode.window.showInformationMessage(`Code lens clicked! URL: ${url}`);
    }
  );

  // Add the test command to context subscriptions
  context.subscriptions.push(testCommand);

  // Register the provider for Elixir files
  const providerDisposable = vscode.languages.registerCodeLensProvider(
    { language: "elixir", scheme: "file" },
    provider
  );

  context.subscriptions.push(providerDisposable);

  return vscode.Disposable.from(testCommand, providerDisposable);
}
