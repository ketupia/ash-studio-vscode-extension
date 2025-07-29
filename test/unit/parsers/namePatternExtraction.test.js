const assert = require("assert");
const { describe, it } = require("mocha");

// Import the module parser function we need to test
// Since we're only testing the regex pattern directly, we'll use a simplified test approach

describe("Name Pattern Extraction", () => {
  it("should correctly extract names with and without colons using (:\\w+|\\w+) pattern", () => {
    // Test pattern that we're using in our configurations
    const namePattern = "(:\\w+|\\w+)";

    // Test cases with different input strings
    const testCases = [
      {
        input: "attribute :email, :string",
        expected: ":email",
      },
      {
        input: "action :request_magic_link do",
        expected: ":request_magic_link",
      },
      {
        input: "read get_by_subject do",
        expected: "get_by_subject",
      },
      {
        input: "create sign_in_with_magic_link do",
        expected: "sign_in_with_magic_link",
      },
    ];

    for (const testCase of testCases) {
      const blockName = testCase.input.split(" ")[0]; // First word is block name
      const blockPos = testCase.input.indexOf(blockName);
      const afterBlockName = testCase.input
        .substring(blockPos + blockName.length)
        .trim();

      // Apply the regex pattern to extract the name
      const nameRegex = new RegExp(namePattern);
      const nameMatch = afterBlockName.match(nameRegex);

      // Check if we got a match
      assert.ok(nameMatch, `Failed to match any name in: ${afterBlockName}`);

      // Verify that the extracted name matches what we expect
      const detailName = nameMatch[0].trim();
      assert.strictEqual(
        detailName,
        testCase.expected,
        `Name extraction failed for "${testCase.input}". Expected "${testCase.expected}" but got "${detailName}"`
      );
    }
  });

  it("should handle more complex Elixir identifiers in name patterns", () => {
    const namePattern = "(:\\w+|\\w+)";

    // More complex test cases with multi-part identifiers
    const testCases = [
      {
        input: "attribute :user_email, :string",
        expected: ":user_email",
      },
      {
        input:
          'calculate :full_name, :string, concat([:first_name, " ", :last_name])',
        expected: ":full_name",
      },
    ];

    for (const testCase of testCases) {
      const blockName = testCase.input.split(" ")[0];
      const blockPos = testCase.input.indexOf(blockName);
      const afterBlockName = testCase.input
        .substring(blockPos + blockName.length)
        .trim();

      const nameRegex = new RegExp(namePattern);
      const nameMatch = afterBlockName.match(nameRegex);

      assert.ok(nameMatch, `Failed to match any name in: ${afterBlockName}`);
      const detailName = nameMatch[0].trim();
      assert.strictEqual(detailName, testCase.expected);
    }
  });
});
