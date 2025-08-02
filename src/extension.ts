import * as vscode from "vscode";
import { AshSidebarProvider } from "./features/ashSidebarProvider";
import { registerAshQuickPick } from "./features/ashQuickPick";
import { registerAshSectionNavigation } from "./features/ashSectionNavigation";
import { registerAshCodeLensProvider } from "./features/ashCodeLensProvider";
import { AshParserService } from "./ashParserService";
import { Logger } from "./utils/logger";
import {
  generateDiagramWebviewContent,
  getOrCreateAshStudioWebview,
} from "./features/ashStudioWebview";
import { CodeLensEntry } from "./types/parser";
import { getTheoreticalDiagramFilePath } from "./utils/diagramUtils";
import { generateDiagramWithMix } from "./utils/diagramMixUtils";

export function activate(context: vscode.ExtensionContext) {
  const logger = Logger.getInstance();
  logger.info("Extension", "activating...");

  try {
    // Initialize the parser service
    const parserService = AshParserService.getInstance();
    // Initialize sidebar
    const sidebarProvider = new AshSidebarProvider(parserService);
    const treeView = vscode.window.createTreeView("ashSidebar", {
      treeDataProvider: sidebarProvider,
      showCollapseAll: true,
    });
    context.subscriptions.push(treeView);

    // Set up document change listeners
    const onActiveEditorChanged = (editor: vscode.TextEditor | undefined) => {
      if (editor && editor.document.languageId === "elixir") {
        parserService.documentActivated(editor.document);
      }
    };

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(onActiveEditorChanged)
    );

    // Trigger parsing for the currently active editor on startup
    if (
      vscode.window.activeTextEditor &&
      vscode.window.activeTextEditor.document.languageId === "elixir"
    ) {
      parserService.documentActivated(vscode.window.activeTextEditor.document);
    }

    // Register features
    registerAshQuickPick(context, parserService);
    registerAshSectionNavigation(context, parserService);
    registerAshCodeLensProvider(context, parserService);

    // Register the reveal command that the sidebar uses
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "ash-studio.revealSectionOrSubBlock",
        (line: number) => {
          const editor = vscode.window.activeTextEditor;
          if (editor && typeof line === "number") {
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
            vscode.window.showTextDocument(editor.document);
          }
        }
      )
    );

    // Register diagram and documentation commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        /**
         * Registers the ash-studio.showDiagram command to display a diagram in a webview panel.
         * Reuses a single webview panel for all diagrams. Resolves the diagram file path using the
         * CodeLensEntry's target (resource file) and diagramSpec, then renders the diagram.
         *
         * @param filePath - The resource file path (unused, kept for compatibility)
         * @param entry - The CodeLensEntry containing diagram metadata and resource info
         */
        "ash-studio.showDiagram",
        async (filePath: string, entry: CodeLensEntry) => {
          const diagramFilePath = getTheoreticalDiagramFilePath(
            entry.target,
            entry.diagramSpec
          );
          const panel = getOrCreateAshStudioWebview(
            `AshStudio Diagram View`,
            "ashDiagramPreview"
          );

          // Set initial content (may be placeholder if file doesn't exist yet)
          panel.webview.html = generateDiagramWebviewContent(
            diagramFilePath,
            panel.webview
          );

          // Run Mix and update the webview when done
          generateDiagramWithMix(entry.target, entry.diagramSpec)
            .then(() => {
              panel.webview.html = generateDiagramWebviewContent(
                diagramFilePath,
                panel.webview
              );
            })
            .catch(err => {
              vscode.window.showErrorMessage(
                `Failed to generate diagram: ${
                  err instanceof Error ? err.message : String(err)
                }`
              );
            });
        }
      )
    );

    logger.info("Extension", "...complete");
  } catch (error) {
    logger.error("Extension", "Extension activation failed", error);
    vscode.window.showErrorMessage(
      `Ash Studio extension failed to activate: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function deactivate() {}
