"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ashSidebarProvider_1 = require("./features/ashSidebarProvider");
const ashQuickPick_1 = require("./features/ashQuickPick");
const ashSectionNavigation_1 = require("./features/ashSectionNavigation");
const ashParserService_1 = require("./ashParserService");
const logger_1 = require("./utils/logger");
// Add debounce helper
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
function activate(context) {
    try {
        console.log("🚀 Ash Studio extension is activating...");
        // Initialize logger first
        const logger = logger_1.Logger.getInstance();
        logger.info("Extension", "Ash Studio extension activating...");
        logger.show();
        logger.info("Extension", "FULL FUNCTIONALITY MODE - Initializing parser service and features");
        // Initialize the parser service with error handling
        let parserService;
        try {
            logger.info("Extension", "Attempting to initialize parser service...");
            // Re-enable real parser service
            parserService = ashParserService_1.AshParserService.getInstance();
            logger.info("Extension", "Parser service initialized successfully (REAL MODE)");
        }
        catch (parserError) {
            logger.error("Extension", "Failed to initialize parser service", parserError);
            vscode.window.showErrorMessage(`Ash Studio parser initialization failed: ${parserError instanceof Error ? parserError.message : String(parserError)}`);
            // Continue without parser functionality
            parserService = null;
        }
        // Initialize sidebar with error handling
        try {
            if (parserService) {
                const sidebarProvider = new ashSidebarProvider_1.AshSidebarProvider(parserService);
                vscode.window.createTreeView("ashSidebar", {
                    treeDataProvider: sidebarProvider,
                });
                // Set up document change listener with debouncing and crash protection
                let isRefreshing = false;
                const debouncedRefresh = debounce(() => {
                    try {
                        if (isRefreshing) {
                            logger.debug("Extension", "Refresh already in progress, skipping");
                            return;
                        }
                        isRefreshing = true;
                        logger.debug("Extension", "Debounced refresh triggered");
                        sidebarProvider.refresh();
                    }
                    catch (refreshError) {
                        logger.error("Extension", "Error refreshing sidebar", refreshError);
                    }
                    finally {
                        isRefreshing = false;
                    }
                }, 300);
                const onActiveEditorChanged = (editor) => {
                    try {
                        logger.debug("Extension", "Active editor changed", {
                            hasEditor: !!editor,
                            fileName: editor?.document?.fileName,
                        });
                        // Clear cache for the new document to avoid conflicts
                        if (parserService &&
                            editor &&
                            "clearCache" in parserService &&
                            typeof parserService.clearCache === "function") {
                            parserService.clearCache(editor.document);
                        }
                        debouncedRefresh();
                    }
                    catch (error) {
                        logger.error("Extension", "Error in onActiveEditorChanged", error);
                    }
                };
                const onDocumentChanged = (e) => {
                    try {
                        if (e.document === vscode.window.activeTextEditor?.document) {
                            logger.debug("Extension", "Document changed, triggering refresh");
                            debouncedRefresh();
                        }
                    }
                    catch (error) {
                        logger.error("Extension", "Error in onDocumentChanged", error);
                    }
                };
                context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onActiveEditorChanged), vscode.workspace.onDidChangeTextDocument(onDocumentChanged));
                logger.info("Extension", "Sidebar provider initialized successfully");
            }
            else {
                // Fallback minimal sidebar if parser failed
                const fallbackSidebar = {
                    getTreeItem: (element) => new vscode.TreeItem("Parser Error", vscode.TreeItemCollapsibleState.None),
                    getChildren: () => [{ label: "Parser service unavailable" }],
                    refresh: () => { },
                    onDidChangeTreeData: new vscode.EventEmitter().event,
                };
                vscode.window.createTreeView("ashSidebar", {
                    treeDataProvider: fallbackSidebar,
                });
            }
        }
        catch (sidebarError) {
            logger.error("Extension", "Failed to initialize sidebar", sidebarError);
            vscode.window.showWarningMessage(`Ash Studio sidebar initialization failed: ${sidebarError instanceof Error ? sidebarError.message : String(sidebarError)}`);
        }
        // Register commands with error handling
        try {
            if (parserService) {
                (0, ashQuickPick_1.registerAshQuickPick)(context, parserService);
                (0, ashSectionNavigation_1.registerAshSectionNavigation)(context, parserService);
                logger.info("Extension", "Navigation features registered successfully");
            }
        }
        catch (navigationError) {
            logger.error("Extension", "Failed to register navigation features", navigationError);
            vscode.window.showWarningMessage(`Ash Studio navigation features failed to initialize: ${navigationError instanceof Error ? navigationError.message : String(navigationError)}`);
        }
        // Register the reveal command that the sidebar uses
        context.subscriptions.push(vscode.commands.registerCommand("ash-studio.revealSectionOrSubBlock", (line) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && typeof line === "number") {
                const position = new vscode.Position(line, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position));
                vscode.window.showTextDocument(editor.document);
            }
        }));
    }
    catch (error) {
        console.error("Critical error during Ash Studio extension activation:", error);
        vscode.window.showErrorMessage(`Ash Studio extension failed to activate: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function deactivate() { }
