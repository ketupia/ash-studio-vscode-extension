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
const config_1 = require("./utils/config");
// Add debounce helper
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
function activate(context) {
    // Initialize services
    const logger = logger_1.Logger.getInstance();
    const config = config_1.ConfigurationManager.getInstance();
    const parserService = ashParserService_1.AshParserService.getInstance();
    logger.info("Extension", "Ash Studio extension activating...");
    // Register the Ash Studio sidebar as a tree view
    const sidebarProvider = new ashSidebarProvider_1.AshSidebarProvider(parserService);
    vscode.window.createTreeView("ashSidebar", {
        treeDataProvider: sidebarProvider,
    });
    // Helper function to parse the current document if it's an Elixir file
    const parseCurrentDocument = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            logger.debug("Extension", `Parsing document: ${editor.document.fileName}`, { language: editor.document.languageId });
            // This will parse and cache the document (only if it's Elixir)
            const result = parserService.parseElixirDocument(editor.document);
            logger.info("Extension", `Parse completed - isAshFile: ${result.isAshFile}`, {
                sectionsCount: result.sections.length,
                errorsCount: result.errors.length,
                fileName: editor.document.fileName,
            });
            if (result.errors.length > 0) {
                result.errors.forEach((error, index) => {
                    logger.warn("Extension", `Parse error ${index + 1}: ${error.message}`, {
                        line: error.line,
                        column: error.column,
                        offset: error.offset,
                    });
                });
            }
            if (result.sections.length > 0) {
                logger.debug("Extension", "Found sections", {
                    sections: result.sections.map((s) => `${s.type}:${s.name}`),
                });
            }
            sidebarProvider.refresh();
        }
    };
    // Parse document when extension activates (if there's an active editor)
    logger.info("Extension", "Extension activated, parsing current document...");
    parseCurrentDocument();
    // Parse document when active editor changes
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        logger.debug("Extension", "Active editor changed, parsing...");
        parseCurrentDocument();
    }));
    // Parse document when it's opened
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === "elixir") {
            parserService.parseElixirDocument(document);
            // Only refresh sidebar if this is the active document
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                sidebarProvider.refresh();
            }
        }
    }));
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
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document === vscode.window.activeTextEditor?.document &&
            e.document.languageId === "elixir") {
            debouncedRefresh();
        }
    }));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand("ash-studio.helloWorld", () => {
        vscode.window.showInformationMessage("Hello from Ash Studio!");
    }));
    (0, ashQuickPick_1.registerAshQuickPick)(context, parserService);
    (0, ashSectionNavigation_1.registerAshSectionNavigation)(context, parserService);
    // Register revealSectionOrSubBlock command for sidebar navigation
    context.subscriptions.push(vscode.commands.registerCommand("ash-studio.revealSectionOrSubBlock", (line) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }));
}
function deactivate() { }
