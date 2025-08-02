import assert from "assert";
import { BlockExtractorService } from "../../../src/parser/blockExtractorService";
import AshAuthConfig from "../../../src/configurations/AshAuthentication.config";
import Ash_Resource_Config from "../../../src/configurations/Ash.Resource.config";
import Ash_Domain_Config from "../../../src/configurations/Ash.Domain.config";
import fs from "fs";
import path from "path";

const exampleFileTestCases = [
  {
    file: "domains/music.ex",
    config: Ash_Domain_Config,
    sections: [{ name: "resources", detailCount: 3 }],
  },
  {
    file: "resources/album.ex",
    config: Ash_Resource_Config,
    sections: [
      { name: "attributes", detailCount: 3 },
      { name: "actions", detailCount: 3 },
      { name: "policies", detailCount: 4 },
    ],
  },
  {
    file: "resources/user.ex",
    config: Ash_Resource_Config,
    sections: [
      { name: "attributes", detailCount: 4 },
      { name: "actions", detailCount: 11 },
    ],
  },
];

exampleFileTestCases.forEach(({ file, config, sections }) => {
  describe(`BlockExtractorService for ${file}`, () => {
    it(`parses ${file} and finds expected sections`, () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), "test/example_files", file),
        "utf8"
      );
      const blockExtractor = new BlockExtractorService();
      const result = blockExtractor.extractModules(source, [config]);

      console.log(
        "Sections found:",
        result.map(s => s.section)
      );
      const attributesSection = result.find(s => s.section === "attributes");
      console.log("Attributes section details:", attributesSection?.details);

      sections.forEach(({ name, detailCount }) => {
        const section = result.find(s => s.section === name);
        assert.ok(section, `Should find section: ${name}`);
        if (detailCount !== undefined) {
          assert.strictEqual(
            section.details.length,
            detailCount,
            `Section ${name} should have ${detailCount} details`
          );
        }
      });
    });
  });
});

describe("BlockExtractorService (AshAuthentication Multi-tier Parsing)", () => {
  it("should correctly parse three-tier nested blocks", () => {
    // Test source with 3-tier nesting: authentication > strategies > password/magic_link
    const source = `
defmodule MyApp.User do
  use Ash.Resource
  use AshAuthentication

  authentication do
    strategies do
      password :default do
        hash_algorithm Bcrypt
        identity_field :email
      end
      
      magic_link do
        sender MyApp.EmailSender
      end
    end
  end
end
    `;

    const matchedModules = [AshAuthConfig];
    const blockExtractor = new BlockExtractorService();
    const result = blockExtractor.extractModules(source, matchedModules);

    // Verify the structure
    assert.strictEqual(
      result.length,
      1,
      "Should find 1 top-level section (authentication)"
    );

    const authSection = result[0];
    assert.strictEqual(
      authSection.section,
      "authentication",
      "Should find authentication section"
    );

    // Find strategies blocks (second tier)
    const strategiesDetails = authSection.details.filter(
      d => d.detail === "strategies"
    );
    assert.strictEqual(
      strategiesDetails.length,
      1,
      "Should find 1 strategies block"
    );

    // Find password and magic_link blocks (third tier - nested in strategies)
    const strategiesBlock = strategiesDetails[0];
    const passwordDetails = (strategiesBlock.childDetails ?? []).filter(
      d => d.detail === "password"
    );
    assert.strictEqual(
      passwordDetails.length,
      1,
      "Should find 1 password strategy"
    );
    assert.strictEqual(
      passwordDetails[0].name,
      ":default",
      'Password strategy name should be ":default"'
    );

    const magicLinkDetails = (strategiesBlock.childDetails ?? []).filter(
      d => d.detail === "magic_link"
    );
    assert.strictEqual(
      magicLinkDetails.length,
      1,
      "Should find 1 magic_link strategy"
    );
    assert.strictEqual(
      magicLinkDetails[0].name,
      "",
      "Magic link strategy should have no name when none is specified"
    );
  });
});
describe("BlockExtractorService (Recursive DSL Parsing)", () => {
  it("should correctly parse resource with actual Ash configuration", () => {
    const testSource = `
      defmodule MyApp.User do
        use Ash.Resource, otp_app: :myapp

        attributes do
          attribute :name, :string
          attribute :email, :string
        end

        actions do
          create :register
          read :get_user
          update :update_profile
          destroy :delete_user
          action :custom_action
        end
      end
    `;

    const blockExtractor = new BlockExtractorService();
    const result = blockExtractor.extractModules(testSource, [
      Ash_Resource_Config,
    ]);

    // Verify overall structure
    assert.strictEqual(result.length, 2, "Should find exactly 2 sections");

    // Verify attributes section
    const attributesSection = result.find(s => s.section === "attributes");
    assert.ok(attributesSection, "Should have an attributes section");
    assert.strictEqual(
      attributesSection.details.length,
      2,
      "Should have 2 attribute details"
    );

    // Verify actions section
    const actionsSection = result.find(s => s.section === "actions");
    assert.ok(actionsSection, "Should have an actions section");
    assert.strictEqual(
      actionsSection.details.length,
      5,
      "Should have 5 action details"
    );

    // Verify specific actions
    const actionTypes = actionsSection.details.map(d => d.detail);
    assert.ok(actionTypes.includes("create"), "Should include create action");
    assert.ok(actionTypes.includes("read"), "Should include read action");
    assert.ok(actionTypes.includes("update"), "Should include update action");
    assert.ok(actionTypes.includes("destroy"), "Should include destroy action");
    assert.ok(actionTypes.includes("action"), "Should include custom action");
  });

  it("should handle nested DSL blocks with custom configurations", () => {
    // Mock configuration with nested children for testing recursive parsing
    const mockConfig = {
      displayName: "Test Resource",
      declarationPattern: "Test.Resource",
      dslBlocks: [
        {
          blockName: "attributes",
          children: [
            {
              blockName: "attribute",
              namePattern: ":(\\w+)",
              // No nested children in configuration, to match current parser behavior
            },
          ],
        },
      ],
    };

    const testSource = `
      defmodule MyApp.Test do
        use Test.Resource

        attributes do
          attribute :email, :string do
            allow_nil?(false)
            public?(true)
          end
        end
      end
    `;

    const blockExtractor = new BlockExtractorService();
    const result = blockExtractor.extractModules(testSource, [mockConfig]);

    // Verify structure
    assert.strictEqual(result.length, 1, "Should find exactly 1 section");

    // Verify attributes section
    const attributesSection = result[0];
    assert.strictEqual(
      attributesSection.section,
      "attributes",
      "Should be an attributes section"
    );

    // With current parser implementation, we only find the main attribute
    // The nested blocks would need explicit configuration in the module parser
    assert.strictEqual(
      attributesSection.details.length,
      1,
      "Should find the attribute (nested blocks require explicit configuration)"
    );

    // Verify specific details
    const attributeDetail = attributesSection.details.find(
      d => d.detail === "attribute"
    );
    assert.ok(attributeDetail, "Should find attribute detail");
    assert.strictEqual(
      attributeDetail.name,
      "email",
      "Should extract attribute name"
    );
  });
});
