const nearley = require("nearley");
const grammar = require("./src/nearley/ashGrammar.js");

// Test valid and invalid atom patterns
const atomTests = [
  // Valid atoms
  { name: "Simple atom", code: ":ok", valid: true },
  { name: "Atom with underscore", code: ":my_atom", valid: true },
  { name: "Atom with question mark", code: ":integer?", valid: true },
  { name: "Atom with exclamation", code: ":save!", valid: true },
  { name: "Atom with numbers", code: ":ISO8601", valid: true },
  { name: "Atom with @ symbol", code: ":foo@bar", valid: true },

  // Invalid atoms (should not match our regex)
  { name: "Atom with dot (invalid)", code: ":My.Atom", valid: false },
  { name: "Atom starting with number", code: ":123", valid: false },
  { name: "Atom with @ at start", code: ":@foo", valid: false },
];

function testAtomSyntax() {
  console.log("=== Testing Atom Syntax Correction ===\n");

  atomTests.forEach((test) => {
    console.log(`Testing: ${test.name}`);
    console.log(`Code: ${test.code}`);
    console.log(`Expected: ${test.valid ? "VALID" : "INVALID"}`);

    // Create a simple test that just tries to parse as an atom value
    const testCode = `defmodule Test do
  ${test.code}
end`;

    try {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      parser.feed(testCode);

      if (parser.results.length === 0) {
        console.log("❌ Parse failed");
      } else {
        console.log("✅ Parse succeeded");
        // Check if the atom was actually recognized
        const result = JSON.stringify(parser.results[0], null, 2);
        if (result.includes(test.code)) {
          console.log("   Atom token found in result");
        } else {
          console.log("   Atom token NOT found in result");
        }
      }
    } catch (error) {
      console.log("❌ Parse error:", error.message);
    }

    console.log("");
  });
}

if (require.main === module) {
  testAtomSyntax();
}
