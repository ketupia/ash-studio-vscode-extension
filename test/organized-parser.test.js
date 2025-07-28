/**
 * Organized Parser Test Suite for Ash Studio VS Code Extension
 *
 * This test suite validates all parser components in an organized structure:
 * - Grammar Parser Tests (Nearley-based)
 * - Configuration-Driven Parser Tests
 * - Regex-Based Parser Tests (Production fallback)
 * - Integration Tests (Parser Service coordination)
 */

console.log("🧪 Loading Ash Studio Parser Tests (Reorganized Structure)...\n");

// Grammar Parser Tests (Nearley-based)
console.log("📝 Grammar Parser Tests:");
require("./unit/parsers/grammarBased/basic-module.test");
require("./unit/parsers/grammarBased/module-attributes.test");
require("./unit/parsers/grammarBased/imports.test");
require("./unit/parsers/grammarBased/strings.test");
require("./unit/parsers/grammarBased/use-statements.test");
require("./unit/parsers/grammarBased/identifiers.test");
require("./unit/parsers/grammarBased/lists.test");
require("./unit/parsers/grammarBased/literals.test");
require("./unit/parsers/grammarBased/ash-blocks.test");
require("./unit/parsers/grammarBased/integration.test");

// Configuration-Driven Parser Tests
console.log("\n⚙️  Configuration-Driven Parser Tests:");
require("./unit/parsers/configurationDriven/findUseDeclarations.test");
require("./unit/parsers/configurationDriven/identifyConfiguredModules.test");
// require("./unit/parsers/configurationDriven/findEndOfBlock.test"); // File doesn't exist yet
require("./unit/parsers/configurationDriven/extractModules.test");
require("./unit/parsers/configurationDriven/recursiveParsing.test");

// Regex-Based Parser Tests (Production fallback)
console.log("\n🛡️  Regex-Based Parser Tests:");
require("./unit/parsers/regexBased/simple-parser.test");

// Parser Unit Tests - Requires VS Code API
console.log("\n🔍 Parser Unit Tests:");
// Skipping tests that require VS Code API
// require("./unit/parsers/parserService.test");

// Integration Tests - Requires VS Code API
console.log("\n🔄 Parser Service Integration Tests:");
// Skipping tests that require VS Code API
// require("./integration/parser-service.test");

console.log("\n✅ All organized parser tests loaded successfully!");
console.log(
  "📁 Tests are now organized by category for better maintainability"
);
