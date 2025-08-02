import assert from "assert";
import { BlockContentExtractor } from "../../../src/parser/blockContentExtractor";

/**
 * Tests for BlockContentExtractor - demonstrates refactoring benefits
 *
 * REFACTORING BENEFITS SHOWN HERE:
 * 1. ISOLATED TESTING: We can test content extraction logic independently
 *    without needing full block parsing infrastructure
 * 2. FOCUSED TESTS: Each test method targets one specific responsibility
 * 3. EASIER DEBUGGING: When a test fails, we know exactly which service has the issue
 * 4. FASTER TESTS: No need to set up complex parsing scenarios for simple content extraction
 *
 * Compare this to the original monolithic service where content extraction
 * logic was buried deep inside complex parsing methods and couldn't be tested
 * independently.
 */
describe("BlockContentExtractor", () => {
  let extractor: BlockContentExtractor;

  beforeEach(() => {
    extractor = new BlockContentExtractor();
  });

  describe("extractDoBlockContent", () => {
    it("should extract content from a simple do...end block", () => {
      const source = "attributes do\n  name :string\n  age :integer\nend";
      const result = extractor.extractDoBlockContent(source, 0, source.length);
      assert.strictEqual(result, "name :string\n  age :integer");
    });

    it("should handle empty blocks", () => {
      const source = "attributes do\nend";
      const result = extractor.extractDoBlockContent(source, 0, source.length);
      assert.strictEqual(result, "");
    });

    it("should handle blocks with whitespace", () => {
      const source = "actions do\n  \n  create :user\n  \nend";
      const result = extractor.extractDoBlockContent(source, 0, source.length);
      assert.strictEqual(result, "\n  create :user\n");
    });
  });

  describe("extractContentToNextBlock", () => {
    it("should extract content up to the next block", () => {
      const source =
        "attributes do\n  name :string\n  age :integer\nactions do";
      const result = extractor.extractContentToNextBlock(
        source,
        0,
        source.lastIndexOf("actions")
      );
      assert.strictEqual(result, "name :string\n  age :integer");
    });
  });

  describe("extractBlockName", () => {
    it("should extract name using name pattern", () => {
      const match = ["create :user do", "create", ":user"] as RegExpMatchArray;
      const namePattern = "(:\\w+|\\w+)";
      const result = extractor.extractBlockName(match, namePattern);
      assert.strictEqual(result, ":user");
    });

    it("should return empty string when no pattern provided", () => {
      const match = ["create :user do", "create", ":user"] as RegExpMatchArray;
      const result = extractor.extractBlockName(match, undefined);
      assert.strictEqual(result, "");
    });

    it("should return empty string when pattern doesn't match", () => {
      const match = ["create do", "create", ""] as RegExpMatchArray;
      const namePattern = "(:\\w+|\\w+)";
      const result = extractor.extractBlockName(match, namePattern);
      assert.strictEqual(result, "");
    });
  });

  describe("prependNameToContent", () => {
    it("should prepend name when provided", () => {
      const result = extractor.prependNameToContent("some content", "user");
      assert.strictEqual(result, "name: user\nsome content");
    });

    it("should return original content when no name", () => {
      const result = extractor.prependNameToContent("some content", "");
      assert.strictEqual(result, "some content");
    });
  });
});
