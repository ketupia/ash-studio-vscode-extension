const nearley = require("nearley");
const grammar = require("./src/nearley/ashGrammar.js");

// Test cases to verify the new specific tokens work
const testCases = [
  {
    name: "Module definition",
    code: `defmodule MyApp.User do
end`,
  },
  {
    name: "Use statement",
    code: `use Ash.Resource`,
  },
  {
    name: "DSL section",
    code: `postgres do
end`,
  },
  {
    name: "Simple macro",
    code: `attribute :name, :string`,
  },
  {
    name: "Qualified function call",
    code: `Date.utc_today()`,
  },
];

function testTokenSpecificity() {
  console.log("=== Testing Specific Token Types ===\n");

  testCases.forEach((testCase) => {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Code: ${testCase.code}`);

    try {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      parser.feed(testCase.code);

      if (parser.results.length === 0) {
        console.log("❌ No parse results");
      } else if (parser.results.length === 1) {
        console.log("✅ Single successful parse");
        console.log("Result:", JSON.stringify(parser.results[0], null, 2));
      } else {
        console.log(`⚠️  Ambiguous parse (${parser.results.length} results)`);
        console.log(
          "First result:",
          JSON.stringify(parser.results[0], null, 2)
        );
      }
    } catch (error) {
      console.log("❌ Parse error:", error.message);
      if (error.message.includes("Unexpected")) {
        // Extract position info if available
        const match = error.message.match(/instead I see a (.+)/);
        if (match) {
          console.log("   Unexpected token:", match[1]);
        }
      }
    }

    console.log("");
  });
}

if (require.main === module) {
  testTokenSpecificity();
}
