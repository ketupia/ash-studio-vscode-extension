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
exports.AshSidebarItem = exports.AshSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
class AshSidebarProvider {
    parserService;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    logger = logger_1.Logger.getInstance();
    constructor(parserService) {
        this.parserService = parserService;
        this.logger.info("AshSidebarProvider", "Sidebar provider initialized");
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.logger.debug("AshSidebarProvider", "No active editor, returning empty sidebar");
            return [];
        }
        const document = editor.document;
        // Use the centralized parser service
        const parseResult = this.parserService.getParseResult(document);
        if (!parseResult.isAshFile) {
            return [];
        }
        if (!element) {
            // Top-level: show main DSL sections
            return parseResult.sections.map(section => new AshSidebarItem(section.section, // Use section.section instead of section.name
            section.details && section.details.length > 0
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None, section.startLine, // Use startLine instead of line
            undefined, {
                command: "ash-studio.revealSectionOrSubBlock",
                title: "Go to Section",
                arguments: [section.startLine],
            }));
        }
        else if (element.sectionLine !== undefined) {
            // Children: show section details within a section
            const section = parseResult.sections.find(s => s.startLine === element.sectionLine);
            if (!section || !section.details || section.details.length === 0)
                return [];
            return section.details.map((detail) => new AshSidebarItem(`${detail.name || detail.detail}`, // Use detail.name or fallback to detail.detail
            vscode.TreeItemCollapsibleState.None, detail.line, section.section, // Use section.section instead of section.name
            {
                command: "ash-studio.revealSectionOrSubBlock",
                title: "Go to Detail",
                arguments: [detail.line],
            }));
        }
        return [];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.AshSidebarProvider = AshSidebarProvider;
class AshSidebarItem extends vscode.TreeItem {
    label;
    collapsibleState;
    sectionLine;
    parentSection;
    command;
    constructor(label, collapsibleState, sectionLine, parentSection, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.sectionLine = sectionLine;
        this.parentSection = parentSection;
        this.command = command;
        if (sectionLine !== undefined) {
            this.command = {
                command: "ash-studio.revealSectionOrSubBlock",
                title: "Go to block",
                arguments: [sectionLine],
            };
        }
        if (parentSection) {
            this.description = parentSection;
        }
    }
}
exports.AshSidebarItem = AshSidebarItem;
