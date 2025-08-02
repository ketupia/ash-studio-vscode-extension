import assert from "assert";
import { SourcePositionCalculator } from "../../../src/parser/sourcePositionCalculator";

describe("SourcePositionCalculator", () => {
  let calculator: SourcePositionCalculator;

  beforeEach(() => {
    calculator = new SourcePositionCalculator();
  });

  describe("getLineNumber", () => {
    it("should return 1 for position 0", () => {
      const source = "line 1\nline 2\nline 3";
      const result = calculator.getLineNumber(source, 0);
      assert.strictEqual(result, 1);
    });

    it("should return correct line number for position after newlines", () => {
      const source = "line 1\nline 2\nline 3";
      const position = source.indexOf("line 2");
      const result = calculator.getLineNumber(source, position);
      assert.strictEqual(result, 2);
    });

    it("should return correct line number for position at end of line", () => {
      const source = "line 1\nline 2\nline 3";
      const position = source.indexOf("\n", source.indexOf("line 1"));
      const result = calculator.getLineNumber(source, position);
      assert.strictEqual(result, 1);
    });
  });

  describe("getColumnNumber", () => {
    it("should return 1 for first character on line", () => {
      const source = "line 1\nline 2\nline 3";
      const position = source.indexOf("line 2");
      const result = calculator.getColumnNumber(source, position);
      assert.strictEqual(result, 1);
    });

    it("should return correct column for character in middle of line", () => {
      const source = "line 1\nline 2\nline 3";
      const position = source.indexOf("2");
      const result = calculator.getColumnNumber(source, position);
      assert.strictEqual(result, 6);
    });
  });

  describe("getPosition", () => {
    it("should return both line and column correctly", () => {
      const source = "line 1\nline 2\nline 3";
      const position = source.indexOf("2");
      const result = calculator.getPosition(source, position);
      assert.deepStrictEqual(result, { line: 2, column: 6 });
    });
  });

  describe("countLines", () => {
    it("should count lines correctly", () => {
      const text = "line 1\nline 2\nline 3";
      const result = calculator.countLines(text);
      assert.strictEqual(result, 3);
    });

    it("should return 1 for single line", () => {
      const text = "single line";
      const result = calculator.countLines(text);
      assert.strictEqual(result, 1);
    });

    it("should handle empty string", () => {
      const text = "";
      const result = calculator.countLines(text);
      assert.strictEqual(result, 1);
    });
  });
});
