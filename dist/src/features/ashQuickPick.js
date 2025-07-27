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
exports.registerAshQuickPick = registerAshQuickPick;
const vscode = __importStar(require("vscode"));
const ashParserService_1 = require("../ashParserService");
function registerAshQuickPick(context, parserService) {
    const parser = parserService || ashParserService_1.AshParserService.getInstance();
    const quickPickCommand = vscode.commands.registerCommand("ash-studio.gotoSection", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active editor");
            return;
        }
        const document = editor.document;
        // Use the centralized parser service
        const parseResult = parser.getParseResult(document);
        if (!parseResult.isAshFile) {
            vscode.window.showInformationMessage("Not an Ash file (Resource, Domain, or Type)");
            return;
        }
        if (parseResult.errors.length > 0) {
            // Show parse errors but still try to show any sections we found
            const errorMsg = parseResult.errors[0].message;
            vscode.window.showWarningMessage(`Parse error: ${errorMsg}`);
        }
        // Create QuickPick items from parsed sections
        const items = parseResult.sections.map(section => ({
            label: section.name,
            description: `Line ${section.line + 1}`, // Convert to 1-based for display
            section: section, // Keep reference to full section data
        }));
        if (items.length === 0) {
            vscode.window.showInformationMessage("No Ash sections found");
            return;
        }
        const pick = await vscode.window.showQuickPick(items, {
            placeHolder: "Go to Ash section...",
        });
        if (pick && pick.section) {
            const position = new vscode.Position(pick.section.line, pick.section.column);
            vscode.window.activeTextEditor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            vscode.window.activeTextEditor.selection = new vscode.Selection(position, position);
        }
    });
    context.subscriptions.push(quickPickCommand);
}
