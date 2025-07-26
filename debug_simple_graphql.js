const { parseAshDocument } = require("./dist/src/ashParser");
const fs = require("fs");

// Test the detailed parser on simple graphql example
const simpleContent = fs.readFileSync("./test_simple_graphql.ex", "utf8");

console.log("=== Testing Simple GraphQL Example ===");
console.log("Content:");
console.log(simpleContent);
console.log("\n=== Parsing Result ===");

try {
  const result = parseAshDocument({
    getText: () => simpleContent,
    uri: { toString: () => "test://simple.ex" },
    version: 1,
  });

  console.log("Success!");
  console.log("Is Ash File:", result.isAshFile);
  console.log("Sections found:", result.sections?.length || 0);
  console.log("Errors:", result.errors?.length || 0);

  if (result.errors && result.errors.length > 0) {
    console.log("First error:", result.errors[0]);
  }
} catch (error) {
  console.log("Parser threw exception:");
  console.log("Error message:", error.message);
  if (error.offset !== undefined) {
    console.log("Error offset:", error.offset);
    const lines = simpleContent.substring(0, error.offset).split("\n");
    console.log(
      "Error at line:",
      lines.length,
      "column:",
      lines[lines.length - 1].length
    );
  }
}
