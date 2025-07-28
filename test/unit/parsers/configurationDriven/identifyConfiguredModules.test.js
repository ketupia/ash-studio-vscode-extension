const {
  identifyConfiguredModules,
  getAllAvailableConfigurations,
} = require("../../../../dist/src/parsers/configurationDriven/moduleParser");
const assert = require("assert");

describe("identifyConfiguredModules", function () {
  // Use the centralized configuration function
  const allConfigs = getAllAvailableConfigurations();

  it("should identify Ash.Resource from a simple use declaration", function () {
    const useDeclarations = ["use Ash.Resource"];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].declarationPattern, "Ash.Resource");
    assert.strictEqual(result[0].displayName, "Ash.Resource");
  });

  it("should identify Ash.Resource from a multiline use declaration", function () {
    const useDeclarations = [
      `use Ash.Resource,
        otp_app: :tunez,
        domain: Tunez.Music,
        extensions: [AshGraphql.Resource, AshJsonApi.Resource]`,
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].declarationPattern, "Ash.Resource");
  });

  it("should only identify the main module, not extensions mentioned in use declarations", function () {
    const useDeclarations = [
      `use Ash.Resource,
        extensions: [SomeExtension.Resource, AnotherExtension.Resource]`,
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should only find Ash.Resource (the main module), not the extensions
    // Extensions parsing happens later in Pass 2
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].declarationPattern, "Ash.Resource");
  });

  it("should identify multiple configured modules from multiple use declarations", function () {
    const useDeclarations = [
      "use Ash.Resource",
      "use AshPostgres.DataLayer, some_option: true",
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    assert.strictEqual(result.length, 2);
    const patterns = result.map(r => r.declarationPattern).sort();
    assert.deepStrictEqual(patterns, ["Ash.Resource", "AshPostgres.DataLayer"]);
  });

  it("should identify AshPaperTrail when configured", function () {
    const useDeclarations = [
      "use Ash.Resource",
      "use AshPaperTrail.Resource", // This module is now configured
      "use SomeOther.Module", // This module is not configured
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should find both Ash.Resource and AshPaperTrail.Resource
    assert.strictEqual(result.length, 2);
    const patterns = result.map(r => r.declarationPattern).sort();
    assert.deepStrictEqual(patterns, [
      "Ash.Resource",
      "AshPaperTrail.Resource",
    ]);
  });

  it("should handle realistic Ash resource with data layer and paper trail", function () {
    const useDeclarations = [
      `use Ash.Resource,
        otp_app: :tunez,
        domain: Tunez.Accounts,
        data_layer: AshPostgres.DataLayer,
        authorizers: [Ash.Policy.Authorizer],
        extensions: [AshGraphql.Resource, AshJsonApi.Resource, AshPaperTrail.Resource]`,
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should find Ash.Resource, AshPostgres.DataLayer, and AshPaperTrail.Resource
    assert.strictEqual(result.length, 3);
    const patterns = result.map(r => r.declarationPattern).sort();
    assert.deepStrictEqual(patterns, [
      "Ash.Resource",
      "AshPaperTrail.Resource",
      "AshPostgres.DataLayer",
    ]);
  });

  it("should handle no matches with completely unconfigured modules", function () {
    const useDeclarations = [
      "use Completely.Unknown.Module",
      "use Another.Unknown.Module",
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    assert.strictEqual(result.length, 0);
  });

  it("should avoid duplicate configs when same module appears multiple times", function () {
    const useDeclarations = [
      "use Ash.Resource, otp_app: :app1",
      "use Ash.Resource, otp_app: :app2", // Same module, different config
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should only return one instance of Ash.Resource config
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].declarationPattern, "Ash.Resource");
  });

  it("should handle empty use declarations", function () {
    const useDeclarations = [];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    assert.strictEqual(result.length, 0);
  });

  it("should handle empty configurations", function () {
    const useDeclarations = ["use Ash.Resource"];
    const emptyConfigs = [];
    const result = identifyConfiguredModules(useDeclarations, emptyConfigs);

    assert.strictEqual(result.length, 0);
  });

  it("should filter out Phoenix/LiveView modules that aren't configured", function () {
    const useDeclarations = [
      "use MyAppWeb, :live_view",
      "use Ash.Resource",
      "use MyAppWeb.ConnCase, async: true",
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should only find Ash.Resource, ignoring Phoenix modules
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].declarationPattern, "Ash.Resource");
  });

  it("should handle mixed Ash and non-Ash modules in realistic file", function () {
    const useDeclarations = [
      `use Ash.Resource,
        otp_app: :myapp,
        data_layer: AshPostgres.DataLayer`,
      "use MyAppWeb, :live_view",
      "use AshPaperTrail.Resource",
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should find all Ash modules but ignore Phoenix modules
    assert.strictEqual(result.length, 3);
    const patterns = result.map(r => r.declarationPattern).sort();
    assert.deepStrictEqual(patterns, [
      "Ash.Resource",
      "AshPaperTrail.Resource",
      "AshPostgres.DataLayer",
    ]);
  });

  it("should not find common Elixir/Phoenix modules", function () {
    const useDeclarations = [
      "use GenServer",
      "use Phoenix.Controller",
      "use Phoenix.LiveView",
      "use Ecto.Schema",
      "use ExUnit.Case",
      "use Plug.Router",
    ];
    const result = identifyConfiguredModules(useDeclarations, allConfigs);

    // Should find no configured modules
    assert.strictEqual(result.length, 0);
  });
});
