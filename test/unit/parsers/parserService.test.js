const assert = require("assert");
const { AshParserService } = require("../../../dist/src/ashParserService");

// Mock the VS Code TextDocument for testing
const mockTextDocument = text => ({
  getText: () => text,
  fileName: "test.ex",
  lineAt: lineIndex => ({
    text: text.split("\n")[lineIndex],
    lineNumber: lineIndex,
    range: {
      start: { line: lineIndex, character: 0 },
      end: { line: lineIndex, character: text.split("\n")[lineIndex].length },
    },
  }),
  lineCount: text.split("\n").length,
  uri: { fsPath: "/path/to/test.ex" },
});

describe("Parser Service Integration", () => {
  it("should parse Ash resource using configuration-driven parser", async () => {
    // Create a basic Ash resource
    const ashSource = `
      defmodule MyApp.User do
        use Ash.Resource, otp_app: :myapp

        attributes do
          attribute :name, :string
          attribute :email, :string
        end

        actions do
          create :register
        end
      end
    `;

    // Initialize the parser service
    const parserService = new AshParserService();

    // Mock document
    const document = mockTextDocument(ashSource);

    // Parse the document
    const result = await parserService.parse(document);

    // Verify overall parsing succeeded
    assert.ok(result, "Should return a parse result");
    assert.ok(result.modules, "Should have modules in result");
    assert.ok(result.modules.length > 0, "Should have at least one module");

    // Verify the module is an Ash Resource
    const resourceModule = result.modules[0];
    assert.strictEqual(
      resourceModule.type,
      "Ash.Resource",
      "Should identify as an Ash Resource"
    );

    // Verify sections were found
    assert.ok(resourceModule.sections, "Should have sections");
    assert.ok(
      resourceModule.sections.length >= 2,
      "Should have at least attributes and actions sections"
    );

    // Find attributes section
    const attributesSection = resourceModule.sections.find(
      s => s.section === "attributes"
    );
    assert.ok(attributesSection, "Should have an attributes section");
    assert.strictEqual(
      attributesSection.details.length,
      2,
      "Should have 2 attributes"
    );

    // Find actions section
    const actionsSection = resourceModule.sections.find(
      s => s.section === "actions"
    );
    assert.ok(actionsSection, "Should have an actions section");
    assert.strictEqual(
      actionsSection.details.length,
      1,
      "Should have 1 action"
    );

    // Verify attribute details
    const nameAttr = attributesSection.details.find(d => d.name === "name");
    assert.ok(nameAttr, "Should have name attribute");
    assert.strictEqual(
      nameAttr.detail,
      "attribute",
      "Should be an attribute detail"
    );

    // Verify action details
    const registerAction = actionsSection.details.find(
      d => d.name === "register"
    );
    assert.ok(registerAction, "Should have register action");
    assert.strictEqual(
      registerAction.detail,
      "create",
      "Should be a create action"
    );
  });

  it("should handle resources with nested blocks", async () => {
    // Create an Ash resource with nested blocks
    const ashSource = `
      defmodule MyApp.Post do
        use Ash.Resource, otp_app: :myapp

        attributes do
          attribute :title, :string do
            # In the real config, these nested blocks wouldn't be recognized
            # This tests that the parser handles nested blocks gracefully
            constraints [min_length: 3]
            default ""
          end
        end

        actions do
          create :publish do
            # Nested action block
            accept [:title]
          end
        end
      end
    `;

    // Initialize the parser service
    const parserService = new AshParserService();

    // Mock document
    const document = mockTextDocument(ashSource);

    // Parse the document
    const result = await parserService.parse(document);

    // Verify parsing succeeded
    assert.ok(result, "Should return a parse result");
    assert.ok(result.modules, "Should have modules in result");
    assert.ok(result.modules.length > 0, "Should have at least one module");

    // Find attributes section
    const resourceModule = result.modules[0];
    const attributesSection = resourceModule.sections.find(
      s => s.section === "attributes"
    );
    assert.ok(attributesSection, "Should have an attributes section");

    // Find actions section
    const actionsSection = resourceModule.sections.find(
      s => s.section === "actions"
    );
    assert.ok(actionsSection, "Should have an actions section");

    // Verify the parser handled the nested blocks gracefully
    // The current implementation only recognizes attributes and actions based on configuration
    assert.strictEqual(
      attributesSection.details.length,
      1,
      "Should have 1 attribute"
    );
    assert.strictEqual(
      actionsSection.details.length,
      1,
      "Should have 1 action"
    );

    // The actual test for nested blocks would need custom configuration
    // This just verifies the parser doesn't crash on nested blocks
  });
});
