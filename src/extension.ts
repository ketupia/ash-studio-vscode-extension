import * as vscode from "vscode";
import { SidebarTreeProvider } from "./vscode/ui/sidebarTreeProvider";
import { registerCommandPaletteSectionNavigation } from "./vscode/ui/commandPaletteSectionNavigation";
import { registerDocumentSymbolProvider } from "./vscode/providers/documentSymbolProvider";
import { registerCodeLensProvider } from "./vscode/providers/codeLensProvider";
import { registerDefinitionProvider } from "./vscode/providers/definitionProvider";
import { ParsedDataProvider } from "./parsedDataProvider";
import { Logger } from "./utils/logger";
import { registerShowDiagram } from "./vscode/providers/registerShowDiagram";
// import { DiagramCodeLensEntry } from "./types/parser"; // Not needed
import { GotoFileLocationEntry } from "./types/commands";

// Debounce map for text change events to prevent excessive parsing
const debounceTimers = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_DELAY_MS = 500;

export function activate(context: vscode.ExtensionContext) {
  const logger = Logger.getInstance();
  logger.info("Extension", "activating...");

  try {
    // Initialize the parser service
    const parserService = ParsedDataProvider.getInstance();
    // Initialize sidebar
    const sidebarProvider = new SidebarTreeProvider(parserService);
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

    const onDocumentChanged = (event: vscode.TextDocumentChangeEvent) => {
      if (event.document.languageId === "elixir") {
        const uri = event.document.uri.toString();

        // Clear any existing debounce timer for this document
        const existingTimer = debounceTimers.get(uri);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Clear cache immediately when document changes
        parserService.clearCache(event.document);

        // Set up debounced re-parsing only if this is the active document
        if (vscode.window.activeTextEditor?.document === event.document) {
          const timer = setTimeout(() => {
            parserService.documentActivated(event.document);
            debounceTimers.delete(uri);
          }, DEBOUNCE_DELAY_MS);

          debounceTimers.set(uri, timer);
        }
      }
    };

    const onDocumentSaved = (document: vscode.TextDocument) => {
      if (document.languageId === "elixir") {
        // Clear cache and re-parse when document is saved
        parserService.clearCache(document);
        parserService.documentActivated(document);
      }
    };

    const onDocumentOpened = (document: vscode.TextDocument) => {
      if (document.languageId === "elixir") {
        parserService.documentActivated(document);
      }
    };

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(onActiveEditorChanged),
      vscode.workspace.onDidChangeTextDocument(onDocumentChanged),
      vscode.workspace.onDidSaveTextDocument(onDocumentSaved),
      vscode.workspace.onDidOpenTextDocument(onDocumentOpened)
    );

    // Trigger parsing for the currently active editor on startup
    if (
      vscode.window.activeTextEditor &&
      vscode.window.activeTextEditor.document.languageId === "elixir"
    ) {
      parserService.documentActivated(vscode.window.activeTextEditor.document);
    }

    // Also parse any already-open Elixir documents in tabs
    vscode.workspace.textDocuments.forEach(document => {
      if (document.languageId === "elixir") {
        parserService.documentActivated(document);
      }
    });

    // Register features
    registerCommandPaletteSectionNavigation(context, parserService);
    registerDocumentSymbolProvider(context, parserService);
    registerCodeLensProvider(context, parserService);
    registerDefinitionProvider(context);

    // Register diagram commands
    // Register diagram show command
    registerShowDiagram(context);

    // Register generic file location navigation command
    context.subscriptions.push(
      vscode.commands.registerCommand(
        /**
         * Registers the ash-studio.gotoFileLocation command to reveal a file and line in the editor.
         * Used by all navigation features (code lenses, QuickPick, sidebar, etc.) for unified navigation.
         *
         * @param filePath - The file path to open
         * @param entry - An object containing targetLine or line (1-based)
         */
        "ash-studio.gotoFileLocation",
        async (filePath: string, entry: GotoFileLocationEntry) => {
          const doc = await vscode.workspace.openTextDocument(filePath);
          const editor = await vscode.window.showTextDocument(doc, {
            preview: false,
          });
          const line = Math.max(0, (entry.targetLine ?? entry.line ?? 1) - 1); // 0-based
          const pos = new vscode.Position(line, 0);
          editor.selection = new vscode.Selection(pos, pos);
          editor.revealRange(
            new vscode.Range(pos, pos),
            vscode.TextEditorRevealType.InCenter
          );
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

export function deactivate() {
  // Clean up any pending debounce timers
  debounceTimers.forEach(timer => clearTimeout(timer));
  debounceTimers.clear();
}
