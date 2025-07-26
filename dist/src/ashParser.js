"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AshParser = void 0;
exports.parseAshDocument = parseAshDocument;
exports.parseAshText = parseAshText;
// Import the compiled Nearley grammar
const nearley = require("nearley");
const grammar = require("./nearley/ashGrammar.js");
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
        try {
            // Create new parser instance with our grammar
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
            parser.feed(text);
            if (parser.results.length === 0) {
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
            // Convert AST to our interface format
            const sections = this.extractSections(ast, text);
            const moduleName = this.extractModuleName(ast);
            return {
                sections,
                errors: [],
                isAshFile: true,
                moduleName,
            };
        }
        catch (error) {
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
        // AST structure exploration and section extraction
        try {
            // The AST should represent a module_definition with a do_block containing expressions
            this.walkASTForSections(ast, sections, originalText);
        }
        catch (error) {
            // If AST walking fails, gracefully return empty sections
            console.warn("AST traversal failed:", error);
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
            node.forEach((child) => this.walkASTForSections(child, sections, originalText));
            return;
        }
        if (typeof node === "object") {
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
            Object.values(node).forEach((value) => {
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
            console.warn("Failed to create section from node:", error);
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
        if (node.value && typeof node.value === "string")
            return node.value;
        if (node.identifier)
            return node.identifier;
        if (node.name)
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
     */
    extractModuleName(ast) {
        // TODO: Implement module name extraction from AST
        return undefined;
    }
    /**
     * Convert parsing errors to our error format
     */
    createParseError(error, text) {
        // Nearley provides error information in error.token
        if (error.token) {
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
        return {
            message: error.message || "Parse error",
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
