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
exports.registerAshSectionNavigation = registerAshSectionNavigation;
const vscode = __importStar(require("vscode"));
const ashParserService_1 = require("../ashParserService");
function registerAshSectionNavigation(context, parserService) {
    const parser = parserService || ashParserService_1.AshParserService.getInstance();
    // DocumentSymbolProvider for Ash Resource/Domain files
    const ashSelector = [
        { language: "elixir", pattern: "**/*.ex" },
    ];
    const provider = {
        provideDocumentSymbols(document, token) {
            // Use cached result if available, otherwise parse
            let parseResult = parser.getCachedResult(document);
            if (!parseResult) {
                parseResult = parser.getParseResult(document);
            }
            if (!parseResult.isAshFile) {
                return [];
            }
            // Return only main DSL sections for breadcrumbs - no nested details
            return parseResult.sections.map((section) => {
                const startPos = new vscode.Position(section.line, section.column);
                const endPos = new vscode.Position(section.endLine, section.endColumn);
                return new vscode.DocumentSymbol(section.name, section.type, vscode.SymbolKind.Class, new vscode.Range(startPos, endPos), new vscode.Range(startPos, startPos));
            });
        },
    };
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(ashSelector, provider));
}
