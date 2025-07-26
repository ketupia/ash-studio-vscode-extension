const { assertParses } = require("./parser-helpers");

describe("Module Attributes", function () {
  it("should parse simple module attributes", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc "A test module"\nend',
      "Simple module attribute"
    );
  });

  it("should parse triple-quoted module attributes", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc """\n  A test module\n  """\nend',
      "Triple-quoted module attribute"
    );
  });

  it("should parse multiple attributes", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc "A test"\n  @doc "Function docs"\nend',
      "Multiple module attributes"
    );
  });

  it("should parse complex triple-quoted strings", function () {
    assertParses(
      'defmodule MyApp.Pets.Pet do\n  @moduledoc """\n  A Pet\n  """\nend',
      "Complex triple-quoted string"
    );
  });
});
