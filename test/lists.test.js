const { assertParses } = require("./parser-helpers");

describe("Lists and Collections", function () {
  it("should parse basic lists", function () {
    assertParses(
      'defmodule Test do\n  table ["name", "email", "phone"]\nend',
      "Basic list with strings"
    );
  });

  it("should parse lists with atoms", function () {
    assertParses(
      "defmodule Test do\n  defaults [:read, :write, :destroy]\nend",
      "List with atoms"
    );
  });

  it("should parse lists with module references", function () {
    assertParses(
      "defmodule Test do\n  notifiers [Ash.Notifier.PubSub, MyApp.Notifier]\nend",
      "List with module references"
    );
  });

  it("should parse mixed lists", function () {
    assertParses(
      'defmodule Test do\n  config [123, "string", :atom, MyModule]\nend',
      "Mixed list with different types"
    );
  });

  it("should parse nested use statement with lists", function () {
    assertParses(
      "defmodule Test do\n  use Ash.Resource, extensions: [AshPaperTrail.Resource, AshGraphql.Resource]\nend",
      "Use statement with list of extensions"
    );
  });
});
