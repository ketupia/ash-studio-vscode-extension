import { findUseDeclarations } from "../../../src/parsers/moduleParser";
import assert from "assert";

describe("findUseDeclarations", function () {
  it("should find a single-line use declaration", function () {
    const content = `use Ash.Resource`;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 1);
    assert(uses[0].startsWith("use Ash.Resource"));
  });

  it("should find a multiline use declaration", function () {
    const content = `
      use Ash.Resource,
        otp_app: :tunez,
        domain: Tunez.Music,
        extensions: [AshGraphql.Resource, AshJsonApi.Resource]
    `;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 1);
    assert(uses[0].includes("Ash.Resource"));
    assert(
      uses[0].includes("extensions: [AshGraphql.Resource, AshJsonApi.Resource]")
    );
  });

  it("should find multiple use declarations", function () {
    const content = `
      use Ash.Resource
      use AshPostgres.DataLayer
      use AshPaperTrail
    `;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 3);
    assert(uses[0].includes("Ash.Resource"));
    assert(uses[1].includes("AshPostgres.DataLayer"));
    assert(uses[2].includes("AshPaperTrail"));
  });

  it("should handle use declarations with continued lines", function () {
    const content = `
      use Ash.Resource,
        otp_app: :myapp,
        domain: MyApp.Domain

      use AshPostgres.DataLayer,
        table: "mytable",
        repo: MyApp.Repo
    `;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 2);
    assert(uses[0].includes("Ash.Resource"));
    assert(uses[0].includes("domain: MyApp.Domain"));
    assert(uses[1].includes("AshPostgres.DataLayer"));
    assert(uses[1].includes("repo: MyApp.Repo"));
  });
});
