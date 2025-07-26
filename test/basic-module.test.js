const { assertParses } = require("./parser-helpers");

describe("Basic Module Structure", function () {
  it("should parse simple module definition", function () {
    assertParses("defmodule Test do\nend", "Simple module definition");
  });

  it("should parse module with nested content", function () {
    assertParses(
      "defmodule MyApp.MyModule do\n  # content here\nend",
      "Module with nested content"
    );
  });

  it("should handle whitespace properly", function () {
    assertParses("defmodule Test do\n  \n  \nend", "Module with whitespace");
  });
});
