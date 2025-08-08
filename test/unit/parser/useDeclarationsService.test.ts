import "jest-extended";
import { UseDeclarationService } from "../../../src/parser/useDeclarationService";

const findUseDeclarations = new UseDeclarationService().findUseDeclarations;

describe("findUseDeclarations", () => {
  it("should find a single-line use declaration", () => {
    const content = `use Ash.Resource`;
    const uses = findUseDeclarations(content);
    expect(uses.length).toBe(1);
    expect(uses[0].startsWith("use Ash.Resource")).toBe(true);
  });

  it("should find a multiline use declaration", () => {
    const content = `
      use Ash.Resource,
        otp_app: :tunez,
        domain: Tunez.Music,
        extensions: [AshGraphql.Resource, AshJsonApi.Resource]
    `;
    const uses = findUseDeclarations(content);
    expect(uses.length).toBe(1);
    expect(uses[0]).toContain("Ash.Resource");
    expect(uses[0]).toContain(
      "extensions: [AshGraphql.Resource, AshJsonApi.Resource]"
    );
  });

  it("should find multiple use declarations", () => {
    const content = `
      use Ash.Resource
      use AshPostgres.DataLayer
      use AshPaperTrail
    `;
    const uses = findUseDeclarations(content);
    expect(uses.length).toBe(3);
    expect(uses[0]).toContain("Ash.Resource");
    expect(uses[1]).toContain("AshPostgres.DataLayer");
    expect(uses[2]).toContain("AshPaperTrail");
  });

  it("should handle use declarations with continued lines", () => {
    const content = `
      use Ash.Resource,
        otp_app: :myapp,
        domain: MyApp.Domain

      use AshPostgres.DataLayer,
        table: "mytable",
        repo: MyApp.Repo
    `;
    const uses = findUseDeclarations(content);
    expect(uses.length).toBe(2);
    expect(uses[0]).toContain("Ash.Resource");
    expect(uses[1]).toContain("AshPostgres.DataLayer");
  });
});
