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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AshParser = void 0;
exports.parseAshDocument = parseAshDocument;
exports.parseAshText = parseAshText;
const logger_1 = require("./utils/logger");
// Import the compiled Nearley grammar
const nearley = __importStar(require("nearley"));
const ashGrammar_js_1 = __importDefault(require("./nearley/ashGrammar.js"));
/**
 * Type guard to check if a value is an AST node
 */
function isASTNode(value) {
    return typeof value === "object" && value !== null && "type" in value;
}
/**
 * Main parser integration class
 */
class AshParser {
    static instance;
    static getInstance() {
        if (!AshParser.instance) {
            AshParser.instance = new AshParser();
        }
        return AshParser.instance;
    }
    /**
     * Parse Ash DSL content from a VS Code document
     */
    parseDocument(document) {
        const text = document.getText();
        return this.parseText(text);
    }
    /**
     * Parse Ash DSL content from raw text
     */
    parseText(text) {
        // Quick check if this looks like an Ash file
        const isAshFile = this.detectAshFile(text);
        if (!isAshFile) {
            return {
                sections: [],
                errors: [],
                isAshFile: false,
            };
        }
        const logger = logger_1.Logger.getInstance();
        try {
            logger.debug("AshParser", "Starting nearley grammar parse", {
                textLength: text.length,
            });
            // Create new parser instance with our grammar
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(ashGrammar_js_1.default));
            logger.debug("AshParser", "Parser created, feeding text...");
            parser.feed(text);
            logger.debug("AshParser", "Text fed to parser", {
                resultsCount: parser.results.length,
            });
            if (parser.results.length === 0) {
                logger.warn("AshParser", "No valid parse found");
                return {
                    sections: [],
                    errors: [
                        {
                            message: "No valid parse found",
                            line: 0,
                            column: 0,
                            offset: 0,
                        },
                    ],
                    isAshFile: true,
                };
            }
            // Take the first successful parse result
            const ast = parser.results[0];
            logger.debug("AshParser", "AST extracted, processing sections...");
            // Convert AST to our interface format
            const sections = this.extractSections(ast, text);
            const moduleName = this.extractModuleName(ast);
            logger.debug("AshParser", "Parse completed successfully", {
                sectionsCount: sections.length,
            });
            return {
                sections,
                errors: [],
                isAshFile: true,
                moduleName,
            };
        }
        catch (error) {
            // More detailed error logging to identify crash location
            logger.error("AshParser", "Grammar parser crashed", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                textPreview: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
            });
            // Parse error - extract position information if available
            const parseError = this.createParseError(error, text);
            return {
                sections: [],
                errors: [parseError],
                isAshFile: true,
            };
        }
    }
    /**
     * Quick heuristic to detect if this is an Ash Resource or Domain file
     */
    detectAshFile(text) {
        // Look for Ash.Resource or Ash.Domain usage
        const ashUsageRegex = /use\s+Ash\.(Resource|Domain)/;
        return ashUsageRegex.test(text);
    }
    /**
     * Extract sections from the parsed AST
     */
    extractSections(ast, originalText) {
        const sections = [];
        const logger = logger_1.Logger.getInstance();
        // AST structure exploration and section extraction
        try {
            // The AST should represent a module_definition with a do_block containing expressions
            this.walkASTForSections(ast, sections, originalText);
        }
        catch (error) {
            // If AST walking fails, gracefully return empty sections
            logger.warn("AshParser", "AST traversal failed", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return sections;
    }
    /**
     * Recursively walk the AST to find Ash DSL sections
     */
    walkASTForSections(node, sections, originalText) {
        if (!node)
            return;
        // Handle different node types
        if (Array.isArray(node)) {
            node.forEach(child => this.walkASTForSections(child, sections, originalText));
            return;
        }
        if (typeof node === "object" && node !== null) {
            // Look for section-like patterns in the AST
            // These are common Ash DSL section names
            const sectionKeywords = [
                "attributes",
                "actions",
                "relationships",
                "calculations",
                "aggregates",
                "identities",
                "policies",
                "preparations",
                "changes",
                "validations",
                "code_interface",
                "postgres",
            ];
            // Check if this node represents a section
            if (this.isAshSection(node, sectionKeywords)) {
                const section = this.createSectionFromNode(node, originalText);
                if (section) {
                    sections.push(section);
                }
            }
            // Recursively traverse object properties
            Object.values(node).forEach(value => {
                this.walkASTForSections(value, sections, originalText);
            });
        }
    }
    /**
     * Check if a node represents an Ash DSL section
     */
    isAshSection(node, sectionKeywords) {
        // Look for patterns that indicate this is a section:
        // - A function/identifier followed by a do block
        // - The identifier matches known section keywords
        if (!isASTNode(node)) {
            return false;
        }
        if (node.type === "simple_keyword_block" ||
            node.type === "generic_do_end_block") {
            const identifier = this.extractIdentifier(node);
            return identifier !== null && sectionKeywords.includes(identifier);
        }
        // Also check for direct keyword matches in the AST structure
        if (typeof node === "string" && sectionKeywords.includes(node)) {
            return true;
        }
        return false;
    }
    /**
     * Create an AshSection from an AST node
     */
    createSectionFromNode(node, originalText) {
        if (!isASTNode(node)) {
            return null;
        }
        try {
            const identifier = this.extractIdentifier(node);
            if (!identifier)
                return null;
            // Calculate line/column positions
            // This is simplified - in a real implementation we'd track positions through the parser
            const lines = originalText.split("\n");
            let line = 0;
            let column = 0;
            // Find the section in the original text
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(identifier) && lines[i].includes("do")) {
                    line = i;
                    column = lines[i].indexOf(identifier);
                    break;
                }
            }
            // Find the end of the section (matching 'end')
            let endLine = line;
            for (let i = line + 1; i < lines.length; i++) {
                if (lines[i].trim() === "end") {
                    endLine = i;
                    break;
                }
            }
            return {
                type: this.mapSectionType(identifier),
                name: identifier,
                line,
                column,
                endLine,
                endColumn: 3, // "end".length
                children: [], // TODO: Extract section details in future iteration
                rawContent: lines.slice(line, endLine + 1).join("\n"),
            };
        }
        catch (error) {
            const logger = logger_1.Logger.getInstance();
            logger.warn("AshParser", "Failed to create section from node", {
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
    /**
     * Extract identifier from AST node
     */
    extractIdentifier(node) {
        // This depends on our AST structure - we'll need to adjust based on actual output
        if (typeof node === "string")
            return node;
        if (!isASTNode(node)) {
            return null;
        }
        if (node.value && typeof node.value === "string")
            return node.value;
        if (node.identifier && typeof node.identifier === "string")
            return node.identifier;
        if (node.name && typeof node.name === "string")
            return node.name;
        // Look in common AST properties
        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                const id = this.extractIdentifier(child);
                if (id)
                    return id;
            }
        }
        return null;
    }
    /**
     * Map section name to our section type
     */
    mapSectionType(sectionName) {
        const typeMap = {
            attributes: "attributes",
            actions: "actions",
            relationships: "relationships",
            calculations: "calculations",
            aggregates: "aggregates",
            identities: "identities",
            policies: "policies",
            preparations: "preparations",
            changes: "changes",
            validations: "validations",
            code_interface: "code_interface",
            postgres: "postgres",
        };
        return typeMap[sectionName] || "generic";
    }
    /**
     * Extract module name from AST
     * @param _ast - AST node (currently unused, for future implementation)
     */
    extractModuleName(_ast) {
        // TODO: Implement module name extraction from AST
        return undefined;
    }
    /**
     * Convert parsing errors to our error format
     */
    createParseError(error, text) {
        // Type guard for error with token property
        const hasToken = (err) => {
            return typeof err === "object" && err !== null && "token" in err;
        };
        // Type guard for error with message property
        const hasMessage = (err) => {
            return typeof err === "object" && err !== null && "message" in err;
        };
        // Nearley provides error information in error.token
        if (hasToken(error)) {
            const lines = text.substring(0, error.token.offset).split("\n");
            const line = lines.length - 1;
            const column = lines[lines.length - 1].length;
            return {
                message: error.message || `Unexpected token: ${error.token.value}`,
                line,
                column,
                offset: error.token.offset,
            };
        }
        // Fallback for other error types
        const message = hasMessage(error) ? error.message : "Parse error";
        return {
            message,
            line: 0,
            column: 0,
            offset: 0,
        };
    }
}
exports.AshParser = AshParser;
/**
 * Convenience function to get parser instance and parse a document
 */
function parseAshDocument(document) {
    return AshParser.getInstance().parseDocument(document);
}
/**
 * Convenience function to parse text directly
 */
function parseAshText(text) {
    return AshParser.getInstance().parseText(text);
}
