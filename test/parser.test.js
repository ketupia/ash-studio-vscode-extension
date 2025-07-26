/**
 * Parser Test Suite for Ash Studio VS Code Extension
 *
 * This test suite validates the Nearley grammar parser for Elixir/Ash DSL code.
 * It's organized into logical groups testing different aspects of the parser.
 */

// Import all test modules
require("./basic-module.test");
require("./module-attributes.test");
require("./imports.test");
require("./strings.test");
require("./use-statements.test");
require("./identifiers.test");
require("./lists.test");
require("./literals.test");
require("./ash-blocks.test");
require("./integration.test");

console.log("✅ All parser tests loaded successfully!");
