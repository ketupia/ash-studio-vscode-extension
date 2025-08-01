import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { Logger } from "../utils/logger";
// Used indirectly through ParseResult.codeLenses
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CodeLensEntry } from "../parsers/parser";
import { ConfigurationManager } from "../utils/config";

/**
 * Provides CodeLens for Ash DSL files, displaying documentation links.
 */
export class AshCodeLensProvider implements vscode.CodeLensProvider {
  // Track disposables for cleanup
  private disposables: vscode.Disposable[] = [];

  // Cache the latest parse result
  private latestParseResult: ReturnType<
    AshParserService["documentActivated"]
  > | null = null;

  constructor(private readonly parserService: AshParserService) {
    // Listen for parse events to refresh code lenses and update cache
    this.disposables.push(
      this.parserService.onDidParse(result => {
        this.latestParseResult = result;
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
   * Provides CodeLens for the given document
   */
  async provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): Promise<vscode.CodeLens[] | null> {
    if (!ConfigurationManager.getInstance().get("enableCodeLens")) {
      return null;
    }
    try {
      if (!this.latestParseResult) {
        return null;
      }
      // Convert our CodeLensEntry objects to VS Code CodeLens objects
      const codeLenses: vscode.CodeLens[] = [];
      for (const entry of this.latestParseResult.codeLenses) {
        // Create a range for the CodeLens
        const line = Math.max(0, entry.line - 1); // Convert to 0-based line number
        const range = new vscode.Range(
          new vscode.Position(line, entry.character),
          new vscode.Position(line, entry.character + 1)
        );

        // Create the CodeLens with a command that opens the documentation URL
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
            arguments: [document.uri.fsPath, entry],
            tooltip: `View diagram for ${entry.source}`,
          };
        } else if (entry.command === "ash-studio.openDocumentation") {
          lens.command = {
            title: entry.title,
            command: entry.command,
            arguments: [entry.target],
            tooltip: `View documentation for ${entry.source}`,
          };
        } else {
          // Fallback: show error if command is unknown
          lens.command = {
            title: entry.title,
            command: "vscode.window.showErrorMessage",
            arguments: [
              `Unknown CodeLens command: ${entry.command} for ${entry.title}`,
            ],
          };
        }

        codeLenses.push(lens);
      }

      // Remove manual diagram CodeLens logic; all CodeLenses now come from parseResult.codeLenses

      return codeLenses;
    } catch (error) {
      Logger.getInstance().error(
        "AshCodeLensProvider",
        `Error providing code lenses: ${error}`
      );
      return null;
    }
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
