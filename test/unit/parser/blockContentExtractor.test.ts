import assert from "assert";
import { BlockContentExtractor } from "../../../src/parser/blockContentExtractor";

describe("BlockContentExtractor", () => {
  let extractor: BlockContentExtractor;

  beforeEach(() => {
    extractor = new BlockContentExtractor();
  });

  describe("extractDoBlockContent", () => {
    it("should extract content from a simple do...end block", () => {
      const source = "attributes do\n  name :string\n  age :integer\nend";
      const result = extractor.extractDoBlockContent(source, 0, source.length);
      assert.strictEqual(result, "\n  name :string\n  age :integer\n");
    });

    it("should handle empty blocks", () => {
      const source = "attributes do\nend";
      const result = extractor.extractDoBlockContent(source, 0, source.length);
      assert.strictEqual(result, "\n");
    });

    it("should handle blocks with whitespace", () => {
      const source = "actions do\n  \n  create :user\n  \nend";
      const result = extractor.extractDoBlockContent(source, 0, source.length);
      assert.strictEqual(result, "\n  \n  create :user\n  \n");
    });
  });

  describe("extractDoBlockContent with hasMatchingEnd=false", () => {
    it("should extract content up to the next block when no matching end", () => {
      const source =
        "attributes do\n  name :string\n  age :integer\nactions do";
      const result = extractor.extractDoBlockContent(
        source,
        0,
        source.lastIndexOf("actions"),
        false
      );
      assert.strictEqual(result, "\n  name :string\n  age :integer\n");
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
