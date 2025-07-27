import * as vscode from "vscode";
import { AshSidebarProvider } from "./features/ashSidebarProvider";
import { registerAshQuickPick } from "./features/ashQuickPick";
import { registerAshSectionNavigation } from "./features/ashSectionNavigation";
import { AshParserService } from "./ashParserService";
import { Logger } from "./utils/logger";

// Add debounce helper
function debounce<T extends (...args: unknown[]) => void>(
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
  try {
    console.log("🚀 Ash Studio extension is activating...");

    // Initialize logger first
    const logger = Logger.getInstance();
    logger.info("Extension", "Ash Studio extension activating...");
    logger.show();

    logger.info(
      "Extension",
      "FULL FUNCTIONALITY MODE - Initializing parser service and features"
    );

    // Initialize the parser service with error handling
    let parserService: AshParserService;
    try {
      logger.info("Extension", "Attempting to initialize parser service...");

      // Re-enable real parser service
      parserService = AshParserService.getInstance();

      logger.info(
        "Extension",
        "Parser service initialized successfully (REAL MODE)"
      );
    } catch (parserError) {
      logger.error(
        "Extension",
        "Failed to initialize parser service",
        parserError
      );
      vscode.window.showErrorMessage(
        `Ash Studio parser initialization failed: ${parserError instanceof Error ? parserError.message : String(parserError)}`
      );
      // Continue without parser functionality
      parserService = null as any;
    }

    // Initialize sidebar with error handling
    try {
      if (parserService) {
        const sidebarProvider = new AshSidebarProvider(parserService);
        vscode.window.createTreeView("ashSidebar", {
          treeDataProvider: sidebarProvider,
        });

        // Set up document change listener with debouncing and crash protection
        let isRefreshing = false;
        const debouncedRefresh = debounce(() => {
          try {
            if (isRefreshing) {
              logger.debug(
                "Extension",
                "Refresh already in progress, skipping"
              );
              return;
            }
            isRefreshing = true;
            logger.debug("Extension", "Debounced refresh triggered");
            sidebarProvider.refresh();
          } catch (refreshError) {
            logger.error("Extension", "Error refreshing sidebar", refreshError);
          } finally {
            isRefreshing = false;
          }
        }, 300);

        const onActiveEditorChanged = (
          editor: vscode.TextEditor | undefined
        ) => {
          try {
            logger.debug("Extension", "Active editor changed", {
              hasEditor: !!editor,
              fileName: editor?.document?.fileName,
            });
            // Clear cache for the new document to avoid conflicts
            if (
              parserService &&
              editor &&
              "clearCache" in parserService &&
              typeof parserService.clearCache === "function"
            ) {
              parserService.clearCache(editor.document);
            }
            debouncedRefresh();
          } catch (error) {
            logger.error("Extension", "Error in onActiveEditorChanged", error);
          }
        };

        const onDocumentChanged = (e: vscode.TextDocumentChangeEvent) => {
          try {
            if (e.document === vscode.window.activeTextEditor?.document) {
              logger.debug("Extension", "Document changed, triggering refresh");
              debouncedRefresh();
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
        // Fallback minimal sidebar if parser failed
        const fallbackSidebar = {
          getTreeItem: (element: any) =>
            new vscode.TreeItem(
              "Parser Error",
              vscode.TreeItemCollapsibleState.None
            ),
          getChildren: () => [{ label: "Parser service unavailable" }],
          refresh: () => {},
          onDidChangeTreeData: new vscode.EventEmitter().event,
        };
        vscode.window.createTreeView("ashSidebar", {
          treeDataProvider: fallbackSidebar as any,
        });
      }
    } catch (sidebarError) {
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
        logger.info("Extension", "Navigation features registered successfully");
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
