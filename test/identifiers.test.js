const { assertParses } = require("./parser-helpers");

describe("Identifiers and References", function () {
  it("should parse basic identifiers", function () {
    assertParses('defmodule Test do\n  name "test"\nend', "Basic identifier");
  });

  it("should parse module names with dots", function () {
    assertParses(
      "defmodule Test do\n  use MyApp.MyModule\nend",
      "Dotted module name"
    );
  });

  it("should parse predicate identifiers with question marks", function () {
    assertParses(
      "defmodule Test do\n  active? true\nend",
      "Predicate identifier with ?"
    );
  });

  it("should parse bang identifiers", function () {
    assertParses(
      "defmodule Test do\n  save! true\nend",
      "Bang identifier with !"
    );
  });

  it("should parse complex module references", function () {
    assertParses(
      "defmodule Test do\n  data_layer AshPostgres.DataLayer\nend",
      "Complex module reference"
    );
  });

  it("should parse remote atoms", function () {
    assertParses(
      "defmodule Test do\n  type :MyModule.my_type\nend",
      "Remote atom"
    );
  });
});
