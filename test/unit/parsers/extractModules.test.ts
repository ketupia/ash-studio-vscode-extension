import assert from "assert";
import { extractModules } from "../../../src/parsers/moduleParser";
import { ParsedSection } from "../../../src/types/parser";

describe("extractModules", function () {
  it("should extract modules correctly", function () {
    const input = `
      // some input that represents a module
    `;
    const expectedOutput: ParsedSection[] = [
      // expected output modules
    ];

    const result = extractModules(input, []);

    assert.deepStrictEqual(result, expectedOutput);
  });

  // ...additional tests
});
