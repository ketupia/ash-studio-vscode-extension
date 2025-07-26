const { assertParses } = require("./parser-helpers");

describe("Import/Require/Alias Statements", function () {
  it("should parse require statements", function () {
    assertParses(
      "defmodule Test do\n  require Ash.Query\nend",
      "Basic require statement"
    );
  });

  it("should parse multiple require statements", function () {
    assertParses(
      "defmodule Test do\n  require Ash.Query\n  require Ash.Expr\nend",
      "Multiple require statements"
    );
  });

  it("should parse alias statements", function () {
    assertParses(
      "defmodule Test do\n  alias MyApp.MyModule\nend",
      "Basic alias statement"
    );
  });

  it("should parse complex alias statements", function () {
    assertParses(
      "defmodule Test do\n  alias MyApp.Pets.Types.Species\nend",
      "Complex alias statement"
    );
  });

  it("should parse mixed require and alias statements", function () {
    assertParses(
      "defmodule Test do\n  require Ash.Query\n  require Ash.Expr\n  alias MyApp.Pets.Types.Species\n  alias MyApp.Pets.Types.Gender\nend",
      "Mixed require and alias statements"
    );
  });
});
