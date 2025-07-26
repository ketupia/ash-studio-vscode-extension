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
                type: "type_definition",
                name: `${typeName.toLowerCase()}_definition`,
                line: lines.findIndex((line) => line.includes("use Ash.Type")),
                column: 0,
                endLine: lines.length - 1,
                endColumn: lines[lines.length - 1].length,
                children: [], // TODO: Could parse individual enum values
                rawContent: typeConfig,
            });
        }
        return {
            isAshFile: true,
            sections,
            errors,
            moduleName: extractModuleName(text),
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
                    children: parseInnerMacros(lines, startLine, endLine), // Parse inner macros for first arguments
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
function parseInnerMacros(lines, startLine, endLine) {
    const children = [];
    for (let i = startLine + 1; i < endLine; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        // Skip empty lines, comments, and end tokens
        if (!trimmed || trimmed.startsWith("#") || trimmed === "end")
            continue;
        // Pattern for top-level macros with first argument extraction
        // Handle various forms:
        //   attribute :name, :string do
        //   create :create do
        //   reference(:album, index?: true, on_delete: :delete)
        //   primary?(true)
        //   uuid_primary_key(:id)
        const macroMatch = trimmed.match(/^(\w+[?!]?)\s*(?:\(?\s*([^,\s)]+))/);
        if (macroMatch) {
            const macroName = macroMatch[1];
            const firstArg = macroMatch[2];
            // If this line has a 'do' at the end, it starts a nested block
            // We should capture this macro but then skip its content
            if (trimmed.endsWith(' do')) {
                // Find the matching 'end' for this nested block and skip to it
                let nestedDepth = 1;
                let j = i + 1;
                while (j < endLine && nestedDepth > 0) {
                    const nestedLine = lines[j].trim();
                    const doCount = (nestedLine.match(/\bdo\b/g) || []).length;
                    const endCount = (nestedLine.match(/\bend\b/g) || []).length;
                    nestedDepth += doCount - endCount;
                    j++;
                }
                // Skip to after the nested block
                i = j - 1;
            }
            // Extract a clean first argument (remove : prefix from atoms, quotes from strings)
            let displayName = macroName;
            if (firstArg) {
                let cleanArg = firstArg.trim();
                // Handle atoms (:name -> name)
                if (cleanArg.startsWith(":")) {
                    cleanArg = cleanArg.substring(1);
                }
                // Handle strings ("name" -> name)
                else if (cleanArg.match(/^["'].*["']$/)) {
                    cleanArg = cleanArg.slice(1, -1);
                }
                // Handle lists ([:read -> read, etc.)
                else if (cleanArg.startsWith("[")) {
                    const listMatch = cleanArg.match(/^\[([^,\]]+)/);
                    if (listMatch) {
                        cleanArg = listMatch[1];
                        if (cleanArg.startsWith(":")) {
                            cleanArg = cleanArg.substring(1);
                        }
                    }
                }
                displayName = cleanArg;
            }
            children.push({
                type: "macro",
                name: displayName,
                macroName: macroName,
                line: i,
                column: line.indexOf(trimmed),
                endLine: i,
                endColumn: line.length,
                rawContent: line,
            });
        }
    }
    return children;
}
