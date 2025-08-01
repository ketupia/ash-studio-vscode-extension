import {
  findUseDeclarations,
  identifyConfiguredModules,
  moduleParser,
} from "../../../src/parsers/moduleParser";
import { configurationRegistry } from "../../../src/configurations/registry";
import assert from "assert";

describe("Paper Trail Parsing", function () {
  const allConfigs = configurationRegistry.getAll();

  describe("Use Declaration Parsing with Bracket Continuation", function () {
    it("should parse use declarations with bracket continuation for extensions", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    domain: MyApp.Pets,
    notifiers: [Ash.Notifier.PubSub],
    authorizers: [Ash.Policy.Authorizer],
    extensions: [
      AshPaperTrail.Resource
    ]
end`;

      const useDeclarations = findUseDeclarations(source);

      assert.strictEqual(useDeclarations.length, 1);
      assert(
        useDeclarations[0].includes("AshPaperTrail.Resource"),
        "Use declaration should include AshPaperTrail.Resource"
      );
      assert(
        useDeclarations[0].includes("extensions: ["),
        "Use declaration should include extensions array"
      );
    });

    it("should parse use declarations with mixed bracket and comma continuation", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    extensions: [
      AshPaperTrail.Resource,
      AshAuthentication
    ],
    domain: MyApp.Domain
end`;

      const useDeclarations = findUseDeclarations(source);

      assert.strictEqual(useDeclarations.length, 1);
      assert(
        useDeclarations[0].includes("AshPaperTrail.Resource"),
        "Use declaration should include AshPaperTrail.Resource"
      );
      assert(
        useDeclarations[0].includes("domain: MyApp.Domain"),
        "Use declaration should include domain after extensions"
      );
    });

    it("should identify AshPaperTrail.Resource from bracket continuation", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    extensions: [
      AshPaperTrail.Resource
    ]
end`;

      const useDeclarations = findUseDeclarations(source);
      const matchedModules = identifyConfiguredModules(
        useDeclarations,
        allConfigs
      );

      const paperTrailModule = matchedModules.find(
        m => m.declarationPattern === "AshPaperTrail.Resource"
      );
      assert(paperTrailModule, "Should identify AshPaperTrail.Resource module");
      assert.strictEqual(paperTrailModule.displayName, "Ash Paper Trail");
    });
  });

  describe("Paper Trail Block Parsing", function () {
    it("should parse simple paper_trail block", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    extensions: [AshPaperTrail.Resource]

  paper_trail do
    primary_key_type :uuid_v7
    change_tracking_mode :snapshot
    store_action_name? true
    ignore_attributes [:inserted_at, :updated_at]
    ignore_actions [:destroy]
  end
end`;

      const result = moduleParser.parse(source);

      assert(result.sections.length > 0, "Should have parsed sections");

      const paperTrailSection = result.sections.find(
        s => s.section === "paper_trail"
      );
      assert(paperTrailSection, "Should have paper_trail section");
      assert(
        paperTrailSection?.rawContent?.includes("primary_key_type :uuid_v7"),
        "Should include primary_key_type configuration"
      );
      assert(
        paperTrailSection?.rawContent?.includes(
          "change_tracking_mode :snapshot"
        ),
        "Should include change_tracking_mode configuration"
      );
      assert(
        paperTrailSection?.rawContent?.includes("store_action_name? true"),
        "Should include store_action_name configuration"
      );
      assert(
        paperTrailSection?.rawContent?.includes(
          "ignore_attributes [:inserted_at, :updated_at]"
        ),
        "Should include ignore_attributes configuration"
      );
      assert(
        paperTrailSection?.rawContent?.includes("ignore_actions [:destroy]"),
        "Should include ignore_actions configuration"
      );
    });

    it("should generate code lens for paper_trail block", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    extensions: [AshPaperTrail.Resource]

  paper_trail do
    primary_key_type :uuid_v7
  end
end`;

      const result = moduleParser.parse(source);

      assert(result.codeLenses.length > 0, "Should have code lenses");

      const paperTrailLens = result.codeLenses.find(
        lens => lens.title && lens.title.includes("Ash Paper Trail")
      );
      assert(paperTrailLens, "Should have Paper Trail code lens");
      assert.strictEqual(
        paperTrailLens.line,
        5,
        "Code lens should be on paper_trail line"
      );
    });

    it("should parse paper_trail in complex Ash resource", function () {
      const source = `defmodule MyApp.Pets.Pet do
  @moduledoc """
  A Pet
  """
  require Ash.Query
  require Ash.Expr

  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    domain: MyApp.Pets,
    notifiers: [Ash.Notifier.PubSub],
    authorizers: [Ash.Policy.Authorizer],
    extensions: [
      AshPaperTrail.Resource
    ]

  postgres do
    table "pets"
    repo MyApp.Repo
  end

  paper_trail do
    primary_key_type :uuid_v7
    change_tracking_mode :snapshot
    store_action_name? true
    ignore_attributes [:inserted_at, :updated_at]
    ignore_actions [:destroy]
  end

  attributes do
    uuid_primary_key :id
    attribute :name, :string
  end

  actions do
    defaults [:create, :read, :update, :destroy]
  end
end`;

      const result = moduleParser.parse(source);

      assert(result.sections.length >= 4, "Should have multiple sections");

      // Check that paper_trail section exists
      const paperTrailSection = result.sections.find(
        s => s.section === "paper_trail"
      );
      assert(paperTrailSection, "Should have paper_trail section");
      assert(paperTrailSection.startLine > 0, "Should have valid start line");
      assert(
        paperTrailSection.endLine > paperTrailSection.startLine,
        "Should have valid end line"
      );

      // Check that other sections also exist (to ensure paper_trail doesn't break other parsing)
      const postgresSection = result.sections.find(
        s => s.section === "postgres"
      );
      const attributesSection = result.sections.find(
        s => s.section === "attributes"
      );
      const actionsSection = result.sections.find(s => s.section === "actions");

      assert(postgresSection, "Should have postgres section");
      assert(attributesSection, "Should have attributes section");
      assert(actionsSection, "Should have actions section");

      // Verify sections are in correct order
      assert(
        paperTrailSection.startLine > (postgresSection?.endLine ?? 0),
        "paper_trail should come after postgres"
      );
      assert(
        attributesSection.startLine > paperTrailSection.endLine,
        "attributes should come after paper_trail"
      );
    });

    it("should handle paper_trail with no configuration options", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    extensions: [AshPaperTrail.Resource]

  paper_trail do
  end
end`;

      const result = moduleParser.parse(source);

      const paperTrailSection = result.sections.find(
        s => s.section === "paper_trail"
      );
      assert(
        paperTrailSection,
        "Should have paper_trail section even with no content"
      );
      assert.strictEqual(
        paperTrailSection?.rawContent?.trim(),
        "",
        "Should have empty raw content"
      );
    });
  });

  describe("Error Handling", function () {
    it("should not parse paper_trail when AshPaperTrail.Resource is not in use declaration", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource

  paper_trail do
    primary_key_type :uuid_v7
  end
end`;

      const result = moduleParser.parse(source);

      // Should not have paper_trail section since AshPaperTrail.Resource is not used
      const paperTrailSection = result.sections.find(
        s => s.section === "paper_trail"
      );
      assert.strictEqual(
        paperTrailSection,
        undefined,
        "Should not have paper_trail section without AshPaperTrail.Resource"
      );
    });

    it("should handle malformed use declarations gracefully", function () {
      const source = `defmodule MyApp.User do
  use Ash.Resource,
    extensions: [
      AshPaperTrail.Resource
    // Missing closing bracket

  paper_trail do
    primary_key_type :uuid_v7
  end
end`;

      // Should not throw an error
      assert.doesNotThrow(() => {
        const result = moduleParser.parse(source);
        // The parser should handle this gracefully, even if it doesn't parse perfectly
        assert.strictEqual(typeof result, "object");
      });
    });
  });
});
