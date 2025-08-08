import registry from "../../../src/configurations/registry";

describe("Configuration Registry", () => {
  it("should return an array of module configurations", () => {
    const configs = registry.getAll();
    expect(Array.isArray(configs)).toBe(true);
    expect(configs.length).toBeGreaterThan(0);
    for (const config of configs) {
      expect(typeof config.displayName).toBe("string");
      expect(typeof config.declarationPattern).toBe("string");
      expect(Array.isArray(config.dslSections)).toBe(true);
    }
  });
});
