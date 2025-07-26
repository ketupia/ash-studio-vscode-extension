import * as vscode from "vscode";
import { AshSidebarProvider } from "./features/ashSidebarProvider";
import { registerAshQuickPick } from "./features/ashQuickPick";
import { registerAshSectionNavigation } from "./features/ashSectionNavigation";
import { AshParserService } from "./ashParserService";

// TODO: Replace Chevrotain references with LSP-based logic if needed

// Add debounce helper
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function activate(context: vscode.ExtensionContext) {
  // Initialize the centralized parser service
  const parserService = AshParserService.getInstance();

  // Register the Ash Studio sidebar as a tree view
  const sidebarProvider = new AshSidebarProvider(parserService);
  vscode.window.createTreeView("ashSidebar", {
    treeDataProvider: sidebarProvider,
  });

  // Helper function to parse the current document if it's an Elixir file
  const parseCurrentDocument = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      console.log(
        `[Ash Studio] Parsing document: ${editor.document.fileName}, language: ${editor.document.languageId}`
      );
      // This will parse and cache the document (only if it's Elixir)
      const result = parserService.parseElixirDocument(editor.document);
      console.log(
        `[Ash Studio] Parse result - isAshFile: ${result.isAshFile}, sections: ${result.sections.length}, errors: ${result.errors.length}`
      );
      if (result.errors.length > 0) {
        result.errors.forEach((error, index) => {
          console.log(`[Ash Studio] Error ${index + 1}:`, {
            message: error.message,
            line: error.line,
            column: error.column,
            offset: error.offset,
          });
        });
      }
      if (result.sections.length > 0) {
        console.log(
          `[Ash Studio] Found sections:`,
          result.sections.map((s) => `${s.type}:${s.name}`)
        );
      }
      sidebarProvider.refresh();
    }
  };

  // Parse document when extension activates (if there's an active editor)
  console.log("[Ash Studio] Extension activated, parsing current document...");
  parseCurrentDocument();

  // Parse document when active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      console.log("[Ash Studio] Active editor changed, parsing...");
      parseCurrentDocument();
    })
  );

  // Parse document when it's opened
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (document.languageId === "elixir") {
        parserService.parseElixirDocument(document);
        // Only refresh sidebar if this is the active document
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === document) {
          sidebarProvider.refresh();
        }
      }
    })
  );

  // Debounced refresh on document changes
  const debouncedRefresh = debounce(() => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === "elixir") {
      // Clear cache for the document to force re-parsing
      parserService.clearCache(editor.document);
      // Re-parse and refresh
      parserService.parseElixirDocument(editor.document);
      sidebarProvider.refresh();
    }
  }, 300);

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (
        e.document === vscode.window.activeTextEditor?.document &&
        e.document.languageId === "elixir"
      ) {
        debouncedRefresh();
      }
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("ash-studio.helloWorld", () => {
      vscode.window.showInformationMessage("Hello from Ash Studio!");
    })
  );

  registerAshQuickPick(context, parserService);
  registerAshSectionNavigation(context, parserService);
  // Register revealSectionOrSubBlock command for sidebar navigation
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "ash-studio.revealSectionOrSubBlock",
      (line: number) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }
        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      }
    )
  );
}

export function deactivate() {}
