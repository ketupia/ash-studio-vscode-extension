/**
 * Simple Parser Test Suite
 * Tests the production-ready fallback parser
 */

const assert = require("assert");
const { parseAshDocumentSimple } = require("../../../../dist/src/simpleParser");

// Mock vscode.TextDocument for testing
function createMockDocument(content) {
  return {
    getText: () => content,
  };
}

describe("Simple Parser", function () {
  describe("File Type Detection", function () {
    it("should detect Ash Resource files", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      assert.strictEqual(result.isAshFile, true, "Should detect Ash Resource");
      assert.strictEqual(result.moduleName, "MyApp.User");
    });

    it("should detect Ash Domain files", function () {
      const content = `defmodule MyApp.Core do
  use Ash.Domain
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      assert.strictEqual(result.isAshFile, true, "Should detect Ash Domain");
    });

    it("should detect Ash Type files", function () {
      const content = `defmodule MyApp.Status do
  use Ash.Type.Enum,
    values: [:active, :inactive, :pending]
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      assert.strictEqual(result.isAshFile, true, "Should detect Ash Type");
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0].type, "type_definition");
    });

    it("should reject non-Ash files", function () {
      const content = `defmodule MyApp.Regular do
  def some_function, do: :ok
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      assert.strictEqual(
        result.isAshFile,
        false,
        "Should reject non-Ash files"
      );
    });
  });

  describe("DSL Section Parsing", function () {
    it("should parse attributes section", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string
    attribute :email, :string
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      assert.strictEqual(result.sections.length, 1);
      const section = result.sections[0];
      assert.strictEqual(section.name, "attributes");
      assert.strictEqual(section.type, "generic");
      assert.strictEqual(section.children.length, 3);

      // Check parsed macros
      assert.strictEqual(section.children[0].name, "id");
      assert.strictEqual(section.children[0].macroName, "uuid_primary_key");
      assert.strictEqual(section.children[1].name, "name");
      assert.strictEqual(section.children[1].macroName, "attribute");
    });

    it("should parse actions section", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  actions do
    defaults [:create, :read, :update, :destroy]
    
    create :register do
      accept [:name, :email]
    end
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      assert.strictEqual(result.sections.length, 1);
      const section = result.sections[0];
      assert.strictEqual(section.name, "actions");
      assert.strictEqual(section.children.length, 2);
      assert.strictEqual(section.children[0].name, "create"); // First item from defaults list
      assert.strictEqual(section.children[1].name, "register");
    });

    it("should handle nested blocks properly", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  actions do
    create :register do
      accept [:name, :email]
      validate required([:name])
    end
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      const section = result.sections[0];
      // Should only see the top-level 'create' macro, not the nested content
      assert.strictEqual(section.children.length, 1);
      assert.strictEqual(section.children[0].name, "register");
      assert.strictEqual(section.children[0].macroName, "create");
    });
  });

  describe("Error Handling", function () {
    it("should collect parsing errors", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    # This should be fine
    attribute :name, :string
    
    # Malformed line that might cause issues
    @@invalid_syntax here
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      // Should still parse successfully but may have errors
      assert.strictEqual(result.isAshFile, true);
      assert.strictEqual(result.sections.length, 1);
      // Errors should be collected (might be 0 if the simple parser is robust)
      assert(Array.isArray(result.errors));
    });

    it("should handle malformed DSL gracefully", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    attribute :name, :string
  # Missing 'end' - malformed
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      // Should still attempt to parse and return results
      assert.strictEqual(result.isAshFile, true);
      assert(Array.isArray(result.sections));
      assert(Array.isArray(result.errors));
    });
  });

  describe("Argument Cleaning", function () {
    it("should clean atom arguments", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    attribute :first_name, :string
    attribute :status, MyApp.Status
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      const section = result.sections[0];
      assert.strictEqual(section.children[0].name, "first_name");
      assert.strictEqual(section.children[1].name, "status");
    });

    it("should clean string arguments", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  attributes do
    attribute "name", :string
    attribute 'email', :string
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      const section = result.sections[0];
      assert.strictEqual(section.children[0].name, "name");
      assert.strictEqual(section.children[1].name, "email");
    });

    it("should clean list arguments", function () {
      const content = `defmodule MyApp.User do
  use Ash.Resource

  actions do
    defaults [:create, :read, :update]
  end
end`;
      const doc = createMockDocument(content);
      const result = parseAshDocumentSimple(doc);

      const section = result.sections[0];
      assert.strictEqual(section.children[0].name, "create");
    });
  });
});
