/**
 * Organized Parser Test Suite for Ash Studio VS Code Extension
 *
 * This test suite validates all parser components in an organized structure:
 * - Grammar Parser Tests (Nearley-based)
 * - Simple Parser Tests (Production fallback)
 * - Hybrid Architecture Tests (Integration between parsers)
 */

console.log("🧪 Loading Ash Studio Parser Tests (Organized Structure)...\n");

// Grammar Parser Tests (Nearley-based)
console.log("📝 Grammar Parser Tests:");
require("./unit/parsers/grammar/basic-module.test");
require("./unit/parsers/grammar/module-attributes.test");
require("./unit/parsers/grammar/imports.test");
require("./unit/parsers/grammar/strings.test");
require("./unit/parsers/grammar/use-statements.test");
require("./unit/parsers/grammar/identifiers.test");
require("./unit/parsers/grammar/lists.test");
require("./unit/parsers/grammar/literals.test");
require("./unit/parsers/grammar/ash-blocks.test");
require("./unit/parsers/grammar/integration.test");

// Simple Parser Tests (Production fallback)
console.log("\n🛡️  Simple Parser Tests:");
require("./unit/parsers/simple/simple-parser.test");

// Hybrid Architecture Tests
console.log("\n🔄 Hybrid Parser Tests:");
require("./unit/parsers/hybrid/hybrid-parser.test");

console.log("\n✅ All organized parser tests loaded successfully!");
console.log(
  "📁 Tests are now organized by category for better maintainability"
);
