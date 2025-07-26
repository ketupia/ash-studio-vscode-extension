const { parseAshDocument } = require("./dist/src/ashParser");
const fs = require("fs");

// Test the detailed parser on track.ex
const trackContent = fs.readFileSync("./examples/resources/track.ex", "utf8");

console.log("=== Testing Detailed Parser on track.ex ===");
console.log("File length:", trackContent.length, "characters");
console.log("First 200 characters:");
console.log(trackContent.substring(0, 200));
console.log("\n=== Parsing Result ===");

try {
  const result = parseAshDocument({
    getText: () => trackContent,
    uri: { toString: () => "test://track.ex" },
    version: 1,
  });

  console.log("Success!");
  console.log("Is Ash File:", result.isAshFile);
  console.log("Sections found:", result.sections?.length || 0);
  console.log("Errors:", result.errors?.length || 0);

  if (result.errors && result.errors.length > 0) {
    console.log("First error:", result.errors[0]);
  }

  if (result.sections && result.sections.length > 0) {
    console.log("First section:", result.sections[0]);
  }
} catch (error) {
  console.log("Parser threw exception:");
  console.log("Error type:", error.constructor.name);
  console.log("Error message:", error.message);
  if (error.token) {
    console.log("Error token:", error.token);
  }
  if (error.offset !== undefined) {
    console.log("Error offset:", error.offset);
    const lines = trackContent.substring(0, error.offset).split("\n");
    console.log(
      "Error at line:",
      lines.length,
      "column:",
      lines[lines.length - 1].length
    );
    console.log(
      "Context:",
      trackContent.substring(Math.max(0, error.offset - 50), error.offset + 50)
    );
  }
}
