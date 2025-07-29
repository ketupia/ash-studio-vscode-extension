/**
 * Organized Parser Test Suite for Ash Studio VS Code Extension
 *
 * This test suite validates all parser components in an organized structure:
 * - Configuration-Driven Parser Tests
 * - Integration Tests (Parser Service coordination)
 */

console.log("🧪 Loading Ash Studio Parser Tests (Reorganized Structure)...\n");

// Parser Tests
console.log("\n⚙️  Parser Tests:");
require("./unit/parsers/findUseDeclarations.test");
require("./unit/parsers/identifyConfiguredModules.test");
// require("./unit/parsers/configurationDriven/findEndOfBlock.test"); // File doesn't exist yet
require("./unit/parsers/extractModules.test");
require("./unit/parsers/recursiveParsing.test");
require("./unit/parsers/authenticationParsing.test");
require("./unit/parsers/paperTrailParsing.test");
require("./unit/parsers/namePatternExtraction.test");

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
