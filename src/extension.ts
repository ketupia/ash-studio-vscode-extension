import * as vscode from "vscode";
import { AshSidebarProvider } from "./features/ashSidebarProvider";
import { registerAshQuickPick } from "./features/ashQuickPick";
import { registerAshSectionNavigation } from "./features/ashSectionNavigation";
import { registerAshCodeLensProvider } from "./features/ashCodeLensProvider";
import { AshParserService } from "./ashParserService";
import { Logger } from "./utils/logger";
import { generateDiagramWebviewContent } from "./features/ashStudioWebview";

// Removed unused debounce helper

export function activate(context: vscode.ExtensionContext) {
  // CRITICAL: Multiple debugging outputs to track activation issues
  console.log("🚀 Ash Studio extension is activating...");
  console.log("📍 Extension activation context:", {
    extensionPath: context.extensionPath,
    globalState: !!context.globalState,
    subscriptions: context.subscriptions.length,
  });

  try {
    // Initialize logger first with EXTENSIVE debugging
    console.log("📝 Initializing logger...");
    const logger = Logger.getInstance();
    console.log("📝 Logger instance created");

    logger.info("Extension", "Ash Studio extension activating...");
    console.log("📝 Logger.info called");

    logger.show();
    console.log("📝 Logger.show() called");

    logger.info(
      "Extension",
      "FULL FUNCTIONALITY MODE - Initializing parser service and features"
    );

    // Initialize the parser service with error handling
    let parserService: AshParserService | null = null;
    try {
      console.log("🔧 Attempting to initialize parser service...");
      logger.info("Extension", "Attempting to initialize parser service...");

      // Re-enable real parser service
      parserService = AshParserService.getInstance();
      console.log("✅ Parser service initialized successfully");

      logger.info(
        "Extension",
        "Parser service initialized successfully (REAL MODE)"
      );
    } catch (parserError) {
      console.error("❌ Parser service initialization failed:", parserError);
      logger.error(
        "Extension",
        "Failed to initialize parser service",
        parserError
      );
      vscode.window.showErrorMessage(
        `Ash Studio parser initialization failed: ${parserError instanceof Error ? parserError.message : String(parserError)}`
      );
      // Continue without parser functionality
      parserService = null;
    }

    // Initialize sidebar with error handling
    try {
      if (parserService) {
        console.log("🎛️ Creating sidebar provider...");
        const sidebarProvider = new AshSidebarProvider(parserService);
        console.log("🎛️ Sidebar provider created");

        console.log("🎛️ Registering tree view with ID: ashSidebar");
        const treeView = vscode.window.createTreeView("ashSidebar", {
          treeDataProvider: sidebarProvider,
          showCollapseAll: true,
        });
        console.log("✅ Tree view registered successfully");

        context.subscriptions.push(treeView);
        console.log("✅ Tree view added to subscriptions");

        // Set up document change listener and parser triggers
        const onActiveEditorChanged = (
          editor: vscode.TextEditor | undefined
        ) => {
          try {
            logger.debug("Extension", "Active editor changed", {
              hasEditor: !!editor,
              fileName: editor?.document?.fileName,
            });
            if (parserService && editor) {
              parserService.documentActivated(editor.document);
            }
          } catch (error) {
            logger.error("Extension", "Error in onActiveEditorChanged", error);
          }
        };

        const onDocumentChanged = (e: vscode.TextDocumentChangeEvent) => {
          try {
            if (
              parserService &&
              e.document === vscode.window.activeTextEditor?.document
            ) {
              parserService.documentActivated(e.document);
            }
          } catch (error) {
            logger.error("Extension", "Error in onDocumentChanged", error);
          }
        };

        context.subscriptions.push(
          vscode.window.onDidChangeActiveTextEditor(onActiveEditorChanged),
          vscode.workspace.onDidChangeTextDocument(onDocumentChanged)
        );

        logger.info("Extension", "Sidebar provider initialized successfully");
      } else {
        console.log("⚠️ Parser service unavailable, creating fallback sidebar");
        logger.warn(
          "Extension",
          "Parser service unavailable, creating fallback sidebar"
        );

        // Fallback minimal sidebar if parser failed
        const fallbackSidebar = {
          getTreeItem: () => {
            return new vscode.TreeItem(
              "Parser Error",
              vscode.TreeItemCollapsibleState.None
            );
          },
          getChildren: () => {
            console.log("🔄 Fallback sidebar getChildren called");
            return [{ label: "Parser service unavailable" }];
          },
          refresh: () => {
            console.log("🔄 Fallback sidebar refresh called");
          },
          onDidChangeTreeData: new vscode.EventEmitter().event,
        };

        console.log("🎛️ Creating fallback tree view...");
        const fallbackTreeView = vscode.window.createTreeView("ashSidebar", {
          treeDataProvider: fallbackSidebar as vscode.TreeDataProvider<unknown>,
          showCollapseAll: false,
        });

        context.subscriptions.push(fallbackTreeView);
        console.log("✅ Fallback sidebar created and registered");
        logger.info("Extension", "Fallback sidebar created");
      }
    } catch (sidebarError) {
      console.error("❌ Sidebar initialization failed:", sidebarError);
      logger.error("Extension", "Failed to initialize sidebar", sidebarError);
      vscode.window.showWarningMessage(
        `Ash Studio sidebar initialization failed: ${sidebarError instanceof Error ? sidebarError.message : String(sidebarError)}`
      );
    }

    // Register commands with error handling
    try {
      if (parserService) {
        registerAshQuickPick(context, parserService);
        registerAshSectionNavigation(context, parserService);
        registerAshCodeLensProvider(context, parserService);
        logger.info(
          "Extension",
          "Navigation features and code lens provider registered successfully"
        );
      }
    } catch (navigationError) {
      logger.error(
        "Extension",
        "Failed to register navigation features",
        navigationError
      );
      vscode.window.showWarningMessage(
        `Ash Studio navigation features failed to initialize: ${navigationError instanceof Error ? navigationError.message : String(navigationError)}`
      );
    }

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
        "ash-studio.showDiagram",
        (filePath: string, entry: any) => {
          const panel = vscode.window.createWebviewPanel(
            "ashDiagramPreview",
            `Ash Diagram: ${entry.source}`,
            vscode.ViewColumn.Beside,
            { enableScripts: true }
          );
          panel.webview.html = generateDiagramWebviewContent(
            entry.target,
            panel.webview
          );
        }
      )
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "ash-studio.openDocumentation",
        (url: string) => {
          vscode.env.openExternal(vscode.Uri.parse(url));
        }
      )
    );
  } catch (error) {
    console.error(
      "Critical error during Ash Studio extension activation:",
      error
    );
    vscode.window.showErrorMessage(
      `Ash Studio extension failed to activate: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function deactivate() {}
