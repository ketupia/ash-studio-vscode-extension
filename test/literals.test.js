const { assertParses } = require("./parser-helpers");

describe("Numbers and Literals", function () {
  it("should parse integer literals", function () {
    assertParses("defmodule Test do\n  count 123\nend", "Integer literal");
  });

  it("should parse negative integers", function () {
    assertParses("defmodule Test do\n  offset -456\nend", "Negative integer");
  });

  it("should parse float literals", function () {
    assertParses("defmodule Test do\n  rate 12.34\nend", "Float literal");
  });

  it("should parse negative floats", function () {
    assertParses(
      "defmodule Test do\n  temperature -5.67\nend",
      "Negative float"
    );
  });

  it("should parse boolean literals", function () {
    assertParses(
      "defmodule Test do\n  active true\n  disabled false\n  value nil\nend",
      "Boolean literals"
    );
  });

  it("should parse atoms", function () {
    assertParses(
      "defmodule Test do\n  type :string\n  status :active\nend",
      "Atom literals"
    );
  });
});
