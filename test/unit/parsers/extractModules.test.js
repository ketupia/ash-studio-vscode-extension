// Tests for the extractModules function
const assert = require("assert");

// Import the testing version of extractModules function
const {
  extractModulesForTesting,
} = require("../../../dist/src/parsers/moduleParser");

// Mock module configurations for testing
const mockAshResourceConfig = {
  displayName: "Ash Resource",
  declarationPattern: "Ash.Resource",
  dslBlocks: [
    {
      blockName: "attributes",
      namePattern: undefined,
      children: [
        {
          blockName: "attribute",
          namePattern: ":?(\\w+)",
        },
      ],
    },
    {
      blockName: "actions",
      namePattern: undefined,
      children: [
        {
          blockName: "create",
          namePattern: ":?(\\w+)",
        },
        {
          blockName: "update",
          namePattern: ":?(\\w+)",
        },
      ],
    },
  ],
};

const mockAshPostgresConfig = {
  displayName: "Ash Postgres",
  declarationPattern: "AshPostgres.DataLayer",
  dslBlocks: [
    {
      blockName: "postgres",
      namePattern: undefined,
      children: [],
    },
  ],
};

describe("extractModules", function () {
  // Test case 1: Simple single module with one DSL block
  it("should extract a simple attributes block", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp

  attributes do
    attribute :name, :string
    attribute :email, :string
  end
end
    `;

    const matchedModules = [mockAshResourceConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 1, "Should find one section");
    assert.strictEqual(
      result[0].section,
      "attributes",
      "Should find attributes section"
    );
    assert.strictEqual(
      result[0].details.length,
      2,
      "Should find two attribute details"
    );
    assert.strictEqual(
      result[0].details[0].name,
      "name",
      "First attribute should be name"
    );
    assert.strictEqual(
      result[0].details[1].name,
      "email",
      "Second attribute should be email"
    );
  });

  // Test case 2: Multiple DSL blocks from same module
  it("should extract multiple DSL blocks from the same module", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp

  attributes do
    attribute :name, :string
  end

  actions do
    create :register
    update :update_profile
  end
end
    `;

    const matchedModules = [mockAshResourceConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 2, "Should find two sections");

    // Check attributes section
    const attributesSection = result.find(s => s.section === "attributes");
    assert.ok(attributesSection, "Should find attributes section");
    assert.strictEqual(
      attributesSection.details.length,
      1,
      "Should find one attribute"
    );
    assert.strictEqual(
      attributesSection.details[0].name,
      "name",
      "Attribute should be name"
    );

    // Check actions section
    const actionsSection = result.find(s => s.section === "actions");
    assert.ok(actionsSection, "Should find actions section");
    assert.strictEqual(
      actionsSection.details.length,
      2,
      "Should find two actions"
    );
    assert.strictEqual(
      actionsSection.details[0].name,
      "register",
      "First action should be register"
    );
    assert.strictEqual(
      actionsSection.details[1].name,
      "update_profile",
      "Second action should be update_profile"
    );
  });

  // Test case 3: Multiple modules with different DSL blocks
  it("should extract DSL blocks from multiple modules", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp
  use AshPostgres.DataLayer

  attributes do
    attribute :name, :string
  end

  postgres do
    table("users")
  end
end
    `;

    const matchedModules = [mockAshResourceConfig, mockAshPostgresConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 2, "Should find two sections");

    // Check attributes section (from Ash.Resource)
    const attributesSection = result.find(s => s.section === "attributes");
    assert.ok(attributesSection, "Should find attributes section");
    assert.strictEqual(
      attributesSection.details.length,
      1,
      "Should find one attribute"
    );

    // Check postgres section (from AshPostgres)
    const postgresSection = result.find(s => s.section === "postgres");
    assert.ok(postgresSection, "Should find postgres section");
    assert.strictEqual(
      postgresSection.details.length,
      0,
      "Should find no child details in postgres section"
    );
  });

  // Test case 4: Nested do/end blocks
  it("should handle nested do/end blocks correctly", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp

  attributes do
    attribute :name, :string do
      allow_nil?(false)
      public?(true)
    end
    attribute :email, :string
  end
end
    `;

    const matchedModules = [mockAshResourceConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 1, "Should find one section");
    assert.strictEqual(
      result[0].section,
      "attributes",
      "Should find attributes section"
    );
    assert.strictEqual(
      result[0].details.length,
      2,
      "Should find two attributes"
    );
    assert.strictEqual(
      result[0].details[0].name,
      "name",
      "First attribute should be name"
    );
    assert.strictEqual(
      result[0].details[1].name,
      "email",
      "Second attribute should be email"
    );
  });

  // Test case 5: No DSL blocks found
  it("should return empty array when no DSL blocks are found", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp

  # No DSL blocks here, just regular functions
  def some_function do
    :ok
  end
end
    `;

    const matchedModules = [mockAshResourceConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 0, "Should find no sections");
  });

  // Test case 6: DSL blocks with no children
  it("should handle DSL blocks with no children", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp

  attributes do
    # Empty attributes block
  end
end
    `;

    const matchedModules = [mockAshResourceConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 1, "Should find one section");
    assert.strictEqual(
      result[0].section,
      "attributes",
      "Should find attributes section"
    );
    assert.strictEqual(result[0].details.length, 0, "Should find no details");
  });

  // Test case 7: Complex real-world example
  it("should handle complex real-world Ash resource", function () {
    const source = `
defmodule MyApp.Album do
  use Ash.Resource, otp_app: :myapp
  use AshPostgres.DataLayer

  attributes do
    uuid_primary_key(:id)
    attribute :name, :string
    attribute :year_released, :integer
    create_timestamp(:inserted_at)
  end

  actions do
    defaults([:read])
    create :create
    update :update
  end

  postgres do
    table("albums")
  end
end
    `;

    const matchedModules = [mockAshResourceConfig, mockAshPostgresConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 3, "Should find three sections");

    // Check we have all expected sections
    const sectionNames = result.map(s => s.section).sort();
    assert.deepStrictEqual(
      sectionNames,
      ["actions", "attributes", "postgres"],
      "Should find all expected sections"
    );

    // Check attributes section has multiple children
    const attributesSection = result.find(s => s.section === "attributes");
    assert.ok(
      attributesSection.details.length >= 2,
      "Should find multiple attributes"
    );
  });

  // Test case 8: Line processing and skipping
  it("should properly skip processed lines to avoid double-processing", function () {
    const source = `
defmodule MyApp.User do
  use Ash.Resource, otp_app: :myapp

  attributes do
    attribute :name, :string do
      allow_nil?(false)
    end
  end

  actions do
    create :register
  end
end
    `;

    const matchedModules = [mockAshResourceConfig];
    const result = extractModulesForTesting(source, matchedModules);

    // Should not double-count any blocks or details
    assert.strictEqual(result.length, 2, "Should find exactly two sections");

    const attributesSection = result.find(s => s.section === "attributes");
    assert.strictEqual(
      attributesSection.details.length,
      1,
      "Should find exactly one attribute"
    );

    const actionsSection = result.find(s => s.section === "actions");
    assert.strictEqual(
      actionsSection.details.length,
      1,
      "Should find exactly one action"
    );
  });

  // Test case 9: Recursive DSL parsing with custom module configuration
  it("should recursively parse nested blocks based on module configuration", function () {
    // Create a mock configuration with nested children for testing recursive parsing
    const mockRecursiveConfig = {
      displayName: "Test Resource",
      declarationPattern: "Test.Resource",
      dslBlocks: [
        {
          blockName: "attributes",
          children: [
            {
              blockName: "attribute",
              namePattern: ":?(\\w+)",
              children: [],
            },
          ],
        },
        {
          blockName: "actions",
          children: [
            {
              blockName: "create",
              namePattern: ":?(\\w+)",
              children: [],
            },
          ],
        },
      ],
    };

    const source = `
defmodule MyApp.TestResource do
  use Test.Resource

  attributes do
    attribute :name, :string do
      allow_nil?(false)
      public?(true)
    end
  end

  actions do
    create :register do
      accept [:name, :email]
      validate presence_of_name
    end
  end
end
    `;

    const matchedModules = [mockRecursiveConfig];
    const result = extractModulesForTesting(source, matchedModules);

    assert.strictEqual(result.length, 2, "Should find two sections");

    // Check attributes section and nested details
    const attributesSection = result.find(s => s.section === "attributes");
    assert.ok(attributesSection, "Should find attributes section");

    // Should find attribute and its nested blocks
    const attributeDetails = attributesSection.details.filter(
      d => d.detail === "attribute"
    );
    assert.strictEqual(attributeDetails.length, 1, "Should find one attribute");
    assert.strictEqual(
      attributeDetails[0].name,
      "name",
      "Attribute should be name"
    );

    // Check actions section and nested details
    const actionsSection = result.find(s => s.section === "actions");
    assert.ok(actionsSection, "Should find actions section");

    // Should find create action and its nested blocks
    const createDetails = actionsSection.details.filter(
      d => d.detail === "create"
    );
    assert.strictEqual(
      createDetails.length,
      1,
      "Should find one create action"
    );
    assert.strictEqual(
      createDetails[0].name,
      "register",
      "Create action should be register"
    );
  });
});
