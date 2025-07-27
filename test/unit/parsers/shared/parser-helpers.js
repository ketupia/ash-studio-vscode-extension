const assert = require("assert");
const nearley = require("nearley");
const grammar = require("../../../../src/nearley/ashGrammar.js");

/**
 * Helper function to test if a piece of Elixir/Ash code parses successfully
 * @param {string} code - The code to parse
 * @param {string} description - Test description
 * @returns {boolean} - Whether parsing was successful
 */
function testParsing(code, description) {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(code);
    return parser.results.length > 0;
  } catch (error) {
    console.log(`❌ ${description}: ${error.message.split("\n")[0]}`);
    return false;
  }
}

/**
 * Helper function to assert that code parses successfully
 * @param {string} code - The code to parse
 * @param {string} description - Test description
 */
function assertParses(code, description) {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(code);
    assert(
      parser.results.length > 0,
      `Expected parsing to succeed but got no results`
    );
  } catch (error) {
    throw new Error(`${description}: ${error.message}`);
  }
}

/**
 * Helper function to assert that code fails to parse
 * @param {string} code - The code to parse
 * @param {string} description - Test description
 */
function assertDoesNotParse(code, description) {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(code);
    if (parser.results.length > 0) {
      throw new Error(
        `${description}: Expected parsing to fail but it succeeded`
      );
    }
  } catch (error) {
    // Expected to fail - error is caught but not used
    return;
  }

  throw new Error(
    `${description}: Expected parsing to fail but got no results without error`
  );
}

module.exports = {
  testParsing,
  assertParses,
  assertDoesNotParse,
  grammar,
};
