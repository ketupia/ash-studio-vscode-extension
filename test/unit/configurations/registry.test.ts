import assert from "assert";
import registry from "../../../src/configurations/registry";

describe("Configuration Registry", () => {
  it("should return an array of module configurations", () => {
    const configs = registry.getAll();
    assert.ok(Array.isArray(configs), "Should return an array");
    assert.ok(configs.length > 0, "Should return at least one configuration");
    for (const config of configs) {
      assert.ok(
        typeof config.displayName === "string",
        "Config should have a displayName"
      );
      assert.ok(
        typeof config.declarationPattern === "string",
        "Config should have a declarationPattern"
      );
      assert.ok(
        Array.isArray(config.dslBlocks),
        "Config should have dslBlocks array"
      );
    }
  });
});
