/**
 * Hybrid Parser Test Suite
 * Tests the interaction between grammar parser and simple parser fallback
 */

const assert = require("assert");
const { parseAshDocumentSimple } = require("../../../../dist/src/simpleParser");
const { testParsing } = require("../shared/parser-helpers");

// Mock vscode.TextDocument for testing
function createMockDocument(content) {
  return {
    getText: () => content,
  };
}

describe("Hybrid Parser Architecture", function () {
  describe("Parser Comparison", function () {
    const testCases = [
      {
        name: "Simple Resource",
        content: `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string
  end
end`,
      },
      {
        name: "Resource with Actions",
        content: `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string
  end

  actions do
    defaults [:create, :read, :update, :destroy]
  end
end`,
      },
      {
        name: "Ash Type Enum",
        content: `defmodule MyApp.Status do
  use Ash.Type.Enum,
    values: [:active, :inactive, :pending]
end`,
      },
    ];

    testCases.forEach(({ name, content }) => {
      it(`should handle ${name} consistently`, function () {
        // Test grammar parser
        const grammarParses = testParsing(content, `Grammar parser: ${name}`);

        // Test simple parser
        const doc = createMockDocument(content);
        const simpleResult = parseAshDocumentSimple(doc);
        const simpleParses =
          simpleResult.isAshFile && simpleResult.errors.length === 0;

        console.log(`  📊 ${name}:`);
        console.log(`    Grammar Parser: ${grammarParses ? "✅" : "❌"}`);
        console.log(`    Simple Parser:  ${simpleParses ? "✅" : "❌"}`);

        // At least one parser should work (fallback strategy)
        assert(
          grammarParses || simpleParses,
          `Both parsers failed for ${name}`
        );

        // If both work, they should agree on basic facts
        if (grammarParses && simpleParses) {
          assert.strictEqual(
            simpleResult.isAshFile,
            true,
            `Simple parser should detect Ash file for ${name}`
          );
        }
      });
    });
  });

  describe("Fallback Scenarios", function () {
    it("should handle complex grammar that might fail grammar parser", function () {
      const content = `defmodule MyApp.Complex do
  use Ash.Resource

  attributes do
    # Complex attribute with multiple options
    attribute :metadata, :map, default: %{}, constraints: [
      instance_of: MyApp.Metadata,
      fields: [
        name: [type: :string, allow_nil?: false],
        tags: [type: {:array, :string}, default: []]
      ]
    ]
  end

  actions do
    create :create_with_metadata do
      accept [:metadata]
      validate {MyValidator, [field: :metadata, strict: true]}
      change {MyChange, [transform: &transform_metadata/1]}
    end
  end
end`;

      // Test simple parser (should be robust)
      const doc = createMockDocument(content);
      const simpleResult = parseAshDocumentSimple(doc);

      assert.strictEqual(simpleResult.isAshFile, true);
      assert(simpleResult.sections.length >= 1);

      // Simple parser should extract basic structure even if complex
      const attributesSection = simpleResult.sections.find(
        s => s.name === "attributes"
      );
      const actionsSection = simpleResult.sections.find(
        s => s.name === "actions"
      );

      if (attributesSection) {
        assert(attributesSection.children.length >= 1);
        assert.strictEqual(attributesSection.children[0].name, "metadata");
      }

      if (actionsSection) {
        assert(actionsSection.children.length >= 1);
        assert.strictEqual(
          actionsSection.children[0].name,
          "create_with_metadata"
        );
      }
    });

    it("should handle malformed but recoverable code", function () {
      const content = `defmodule MyApp.Partial do
  use Ash.Resource

  attributes do
    attribute :name, :string
    # Missing comma or malformed syntax
    attribute :email :string invalid_syntax
    attribute :age, :integer
  end
end`;

      const doc = createMockDocument(content);
      const simpleResult = parseAshDocumentSimple(doc);

      // Simple parser should be resilient
      assert.strictEqual(simpleResult.isAshFile, true);
      assert(simpleResult.sections.length >= 1);

      // Should still extract what it can
      const section = simpleResult.sections[0];
      assert(section.children.length >= 2); // Should get 'name' and 'age' at minimum
    });
  });

  describe("Performance Comparison", function () {
    it("should complete parsing within reasonable time", function () {
      const largeContent = `defmodule MyApp.LargeResource do
  use Ash.Resource

  attributes do
${Array.from(
  { length: 50 },
  (_, i) => `    attribute :field_${i}, :string`
).join("\n")}
  end

  actions do
${Array.from(
  { length: 20 },
  (_, i) => `    create :create_${i} do\n      accept [:field_${i}]\n    end`
).join("\n")}
  end
end`;

      const doc = createMockDocument(largeContent);

      const startTime = Date.now();
      const result = parseAshDocumentSimple(doc);
      const endTime = Date.now();

      const duration = endTime - startTime;
      console.log(`  ⏱️  Simple parser processed large file in ${duration}ms`);

      // Should complete in reasonable time (< 1 second)
      assert(duration < 1000, `Simple parser took too long: ${duration}ms`);
      assert.strictEqual(result.isAshFile, true);
      assert(result.sections.length >= 2);
    });
  });
});
