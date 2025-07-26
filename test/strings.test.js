const { assertParses } = require("./parser-helpers");

describe("String Literals", function () {
  it("should parse double-quoted strings", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc "A simple string"\nend',
      "Double-quoted string"
    );
  });

  it("should parse single-quoted strings", function () {
    assertParses(
      "defmodule Test do\n  @moduledoc 'A simple string'\nend",
      "Single-quoted string"
    );
  });

  it("should parse triple-quoted strings", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc """\n  A multi-line\n  string\n  """\nend',
      "Triple-quoted string"
    );
  });

  it("should parse strings with escape sequences", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc "A string with \\"quotes\\" and \\n newlines"\nend',
      "String with escape sequences"
    );
  });

  it("should not confuse empty string with triple-quote start", function () {
    assertParses(
      'defmodule Test do\n  @moduledoc """\n  Content\n  """\nend',
      "Triple-quoted string not confused with empty string"
    );
  });
});
