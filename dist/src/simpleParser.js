"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAshDocumentSimple = parseAshDocumentSimple;
function parseAshDocumentSimple(document) {
    const text = document.getText();
    const lines = text.split("\n");
    // Check if this is an Ash file (Resource, Domain, or Type)
    const isAshResource = /use\s+Ash\.(Resource|Domain)/.test(text);
    const isAshType = /use\s+Ash\.Type\.(Enum|Union|NewType)/.test(text);
    const isAshFile = isAshResource || isAshType;
    if (!isAshFile) {
        return {
            isAshFile: false,
            sections: [],
            errors: [],
        };
    }
    const sections = [];
    const errors = [];
    // Handle Ash.Type.Enum files (simple, no DSL blocks)
    if (isAshType && !isAshResource) {
        // For Ash types, we can extract the type definition as a "section"
        const typeMatch = text.match(/use\s+Ash\.Type\.(\w+),?\s*(.+)/);
        if (typeMatch) {
            const typeName = typeMatch[1]; // "Enum", "Union", etc.
            const typeConfig = typeMatch[2]; // "values: [:admin, :editor, :user]"
            sections.push({
                type: 'type_definition',
                name: `${typeName.toLowerCase()}_definition`,
                line: lines.findIndex(line => line.includes('use Ash.Type')),
                column: 0,
                endLine: lines.length - 1,
                endColumn: lines[lines.length - 1].length,
                children: [], // TODO: Could parse individual enum values
                rawContent: typeConfig
            });
        }
        return {
            isAshFile: true,
            sections,
            errors,
            moduleName: extractModuleName(text)
        };
    }
    // Simple regex patterns for common Ash DSL blocks
    const blockPatterns = [
        /^\s*(attributes|actions|relationships|calculations|aggregates|identities|policies|preparations|changes|validations|postgres|graphql|json_api|admin)\s+do\s*$/,
    ];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of blockPatterns) {
            const match = line.match(pattern);
            if (match) {
                const sectionName = match[1];
                const startLine = i;
                const startColumn = line.indexOf(sectionName);
                // Find the matching 'end' for this block
                let endLine = startLine;
                let blockDepth = 1;
                let endColumn = 0;
                for (let j = i + 1; j < lines.length && blockDepth > 0; j++) {
                    const currentLine = lines[j];
                    // Count 'do' and 'end' to track nesting
                    const doMatches = (currentLine.match(/\bdo\b/g) || []).length;
                    const endMatches = (currentLine.match(/\bend\b/g) || []).length;
                    blockDepth = blockDepth + doMatches - endMatches;
                    if (blockDepth === 0) {
                        endLine = j;
                        endColumn = currentLine.length;
                        break;
                    }
                }
                sections.push({
                    type: "generic",
                    name: sectionName,
                    line: startLine,
                    column: startColumn,
                    endLine: endLine,
                    endColumn: endColumn,
                    children: [], // TODO: Parse section details
                    rawContent: lines.slice(startLine, endLine + 1).join("\n"),
                });
            }
        }
    }
    return {
        isAshFile: true,
        sections,
        errors,
        moduleName: extractModuleName(text),
    };
}
function extractModuleName(text) {
    const match = text.match(/defmodule\s+([A-Za-z_][A-Za-z0-9_.]*)/);
    return match ? match[1] : undefined;
}
