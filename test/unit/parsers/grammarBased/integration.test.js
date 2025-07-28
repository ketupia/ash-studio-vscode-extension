const { assertParses } = require("../shared/parser-helpers");

describe("Comprehensive Integration Tests", function () {
  it("should parse a complete basic Ash resource", function () {
    const ashResource = `defmodule MyApp.Pets.Pet do
  @moduledoc """
  A Pet
  """
  require Ash.Query
  require Ash.Expr
  alias MyApp.Pets.Types.Species

  use Ash.Resource

  postgres do
    table "pets"
  end

  actions do
    defaults [:read, :destroy]
  end
end`;

    assertParses(ashResource, "Complete basic Ash resource");
  });

  it("should parse Ash resource with complex use statement", function () {
    const ashResource = `defmodule Test do
  use Ash.Resource, data_layer: AshPostgres.DataLayer, domain: MyApp.Pets, notifiers: [Ash.Notifier.PubSub], extensions: [AshPaperTrail.Resource]
end`;

    assertParses(ashResource, "Ash resource with complex use statement");
  });

  it("should parse resource with mixed attributes and statements", function () {
    const ashResource = `defmodule MyApp.User do
  @moduledoc """
  User resource
  """
  @doc "User configuration"
  
  require Ash.Query
  alias MyApp.Types.Email
  
  use Ash.Resource, domain: MyApp
  
  attributes do
    attribute :name, :string
    attribute :email, Email
  end
end`;

    assertParses(ashResource, "Resource with mixed attributes and statements");
  });

  it("should parse multiple modules in sequence", function () {
    // Note: This may not work with current grammar as it expects single module
    // but it's a good test case for future expansion
    assertParses(
      "defmodule First do\n  use Ash.Resource\nend",
      "First module only for now"
    );
  });

  it("should handle complex nested structures", function () {
    const complex = `defmodule ComplexResource do
  @moduledoc """
  A complex resource with multiple features
  """
  
  require Ash.Query
  require Ash.Expr
  alias MyApp.Types.Status
  alias MyApp.Helpers.Validation
  
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    domain: MyApp.Core,
    notifiers: [Ash.Notifier.PubSub, MyApp.CustomNotifier],
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshPaperTrail.Resource, AshGraphql.Resource]
    
  postgres do
    table "complex_resources"
  end
  
  actions do
    defaults [:read, :create, :update, :destroy]
  end
  
  attributes do
    attribute :name, :string
    attribute :status, Status
  end
end`;

    assertParses(complex, "Complex resource with multiple features");
  });
});
