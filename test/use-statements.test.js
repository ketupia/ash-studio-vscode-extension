const { assertParses } = require("./parser-helpers");

describe("Use Statements", function () {
  it("should parse simple use statements", function () {
    assertParses(
      "defmodule Test do\n  use Ash.Resource\nend",
      "Simple use statement"
    );
  });

  it("should parse use statements with module references as values", function () {
    assertParses(
      "defmodule Test do\n  use Ash.Resource, data_layer: AshPostgres.DataLayer\nend",
      "Use statement with module reference value"
    );
  });

  it("should parse use statements with multiple options", function () {
    assertParses(
      "defmodule Test do\n  use Ash.Resource, data_layer: AshPostgres.DataLayer, domain: MyApp.Pets\nend",
      "Use statement with multiple options"
    );
  });

  it("should parse use statements with list values containing module references", function () {
    assertParses(
      "defmodule Test do\n  use Ash.Resource, notifiers: [Ash.Notifier.PubSub]\nend",
      "Use statement with list containing module references"
    );
  });

  it("should parse complex use statements", function () {
    assertParses(
      "defmodule Test do\n  use Ash.Resource, data_layer: AshPostgres.DataLayer, domain: MyApp.Pets, notifiers: [Ash.Notifier.PubSub], authorizers: [Ash.Policy.Authorizer], extensions: [AshPaperTrail.Resource]\nend",
      "Complex use statement with multiple options"
    );
  });
});
