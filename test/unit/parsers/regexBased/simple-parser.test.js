/**
 * Simple Parser Test Suite
 * Tests the production-ready fallback parser
 */

const assert = require("assert");
const {
  SimpleParser,
} = require("../../../../dist/src/parsers/regexBased/simpleParser");

// Helper function to parse content using the new SimpleParser interface
function parseContent(content) {
  const parser = new SimpleParser();
  return parser.parse(content);
}

describe("Simple Parser", function () {
  describe("File Type Detection", function () {
    it("should detect Ash Resource files", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true, "Should detect Ash Resource");
      assert.strictEqual(result.moduleName, "MyApp.User");
    });

    it("should detect Ash Domain files", function () {
      const content = `defmodule MyApp.Core do
  use Ash.Domain
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true, "Should detect Ash Domain");
    });

    it("should detect Ash Type files", function () {
      const content = `defmodule MyApp.Status do
  use Ash.Type.Enum,
    values: [:active, :inactive, :pending]
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true, "Should detect Ash Type");
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0].section, "enum_definition");
    });

    it("should reject non-Ash files", function () {
      const content = `defmodule MyApp.Other do
  def hello, do: "world"
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, false, "Should not detect as Ash");
      assert.strictEqual(result.sections.length, 0);
    });
  });

  describe("Section Parsing", function () {
    it("should parse attributes section", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string
  end
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true);
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0].section, "attributes");
    });

    it("should parse multiple sections", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
  end

  actions do
    defaults [:create, :read, :update, :destroy]
  end

  relationships do
    has_many :posts, MyApp.Post
  end
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true);
      assert.strictEqual(result.sections.length, 3);

      const sectionNames = result.sections.map(s => s.section).sort();
      assert.deepStrictEqual(sectionNames, [
        "actions",
        "attributes",
        "relationships",
      ]);
    });

    it("should handle nested blocks", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  actions do
    create :create do
      primary? true
    end
  end
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true);
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0].section, "actions");
    });

    it("should parse postgres section", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  postgres do
    table "users"
    repo MyApp.Repo
  end
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true);
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0].section, "postgres");
    });

    it("should parse validations section", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  validations do
    validate present(:name)
    validate {MyApp.Validations, :unique_email}
  end
end`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true);
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0].section, "validations");
    });
  });

  describe("Error Handling", function () {
    it("should handle malformed content gracefully", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource
  
  attributes do
    # missing end
`;
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, true);
      // Should still identify the attributes section even if malformed
      assert.strictEqual(result.sections.length, 1);
    });

    it("should handle empty content", function () {
      const content = "";
      const result = parseContent(content);

      assert.strictEqual(result.isAshFile, false);
      assert.strictEqual(result.sections.length, 0);
    });

    it("should return parser name in result", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource
end`;
      const result = parseContent(content);

      assert.strictEqual(result.parserName, "SimpleParser");
    });
  });
});
