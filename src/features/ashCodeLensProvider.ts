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

  constructor(private readonly parserService: AshParserService) {
    // Listen for parse events to refresh code lenses when content changes
    this.disposables.push(
      this.parserService.onDidParse(() => {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken
  ): Promise<vscode.CodeLens[] | null> {
    // Check if CodeLens is enabled in settings
    if (!ConfigurationManager.getInstance().get("enableCodeLens")) {
      return null;
    }

    try {
      // Get parse results for this document
      const parseResult = await this.parserService.getParseResult(document);
      if (!parseResult || !parseResult.isAshFile) {
        return null;
      }

      // Convert our CodeLensEntry objects to VS Code CodeLens objects
      const codeLenses: vscode.CodeLens[] = [];

      for (const entry of parseResult.codeLenses) {
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

        try {
          const uri = vscode.Uri.parse(entry.target);
          Logger.getInstance().debug(
            "AshCodeLensProvider",
            `Parsed URI: ${uri.toString()}`
          );

          // Use our custom command for better control and logging
          lens.command = {
            title: entry.title,
            command: "ash-studio.openDocumentation",
            arguments: [entry.target],
            tooltip: `View documentation for ${entry.source}`,
          };

          // Alternative: use the built-in vscode.open command if needed
          // lens.command = {
          //   title: entry.title,
          //   command: "vscode.open",
          //   arguments: [uri],
          //   tooltip: `View documentation for ${entry.source}`
          // };
        } catch (error) {
          Logger.getInstance().error(
            "AshCodeLensProvider",
            `Failed to parse URI: ${entry.target}`,
            error
          );
          // Fallback: create a command that shows an error message
          lens.command = {
            title: entry.title,
            command: "vscode.window.showErrorMessage",
            arguments: [`Failed to open documentation: ${entry.target}`],
          };
        }

        codeLenses.push(lens);
      }

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

  // Register a custom command for opening documentation URLs
  const openDocsCommand = vscode.commands.registerCommand(
    "ash-studio.openDocumentation",
    async (url: string) => {
      console.log(
        `[CodeLens Command] ash-studio.openDocumentation called with URL: ${url}`
      );
      Logger.getInstance().info(
        "AshCodeLensProvider",
        `Command called: opening documentation URL: ${url}`
      );

      try {
        console.log(`[CodeLens Command] Attempting to open URL: ${url}`);
        const uri = vscode.Uri.parse(url);
        console.log(`[CodeLens Command] Parsed URI:`, uri.toString());

        // Try multiple methods to handle different environments (like Windsurf)
        try {
          // Method 1: Use the VS Code built-in API (primary method)
          await vscode.env.openExternal(uri);
          console.log(
            `[CodeLens Command] Successfully opened URL with openExternal: ${url}`
          );
        } catch (primaryError) {
          console.warn(
            `[CodeLens Command] openExternal failed, trying alternative: ${primaryError}`
          );

          // Method 2: Try to use the built-in open command as fallback
          await vscode.commands.executeCommand("vscode.open", uri);
          console.log(
            `[CodeLens Command] Successfully opened URL with vscode.open command: ${url}`
          );
        }

        // Show a user notification that we attempted to open the URL
        // This is useful in Windsurf where the browser might not open visibly
        vscode.window.showInformationMessage(
          `Documentation URL: ${url} (URL should open in your default browser)`
        );

        Logger.getInstance().info(
          "AshCodeLensProvider",
          `Successfully processed URL open request: ${url}`
        );
      } catch (error) {
        console.error(`[CodeLens Command] Failed to open URL: ${url}`, error);
        Logger.getInstance().error(
          "AshCodeLensProvider",
          `Failed to open URL: ${url}`,
          error
        );
        vscode.window.showErrorMessage(
          `Failed to open documentation: ${url}. Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  // Register the provider for Elixir files
  const providerDisposable = vscode.languages.registerCodeLensProvider(
    { language: "elixir", scheme: "file" },
    provider
  );

  context.subscriptions.push(openDocsCommand);
  context.subscriptions.push(providerDisposable);

  return vscode.Disposable.from(
    testCommand,
    openDocsCommand,
    providerDisposable
  );
}
