import { findUseDeclarations } from "../../../../src/parsers/configurationDriven/moduleParser";
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
    assert(
      uses[0].includes("extensions: [AshGraphql.Resource, AshJsonApi.Resource]")
    );
  });

  it("should find multiple use declarations", function () {
    const content = `
      use Ash.Resource,
        extensions: [AshGraphql.Resource]
      use Ash.OtherModule,
        extensions: [Other.Extension]
    `;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 2);
    assert(uses[0].startsWith("use Ash.Resource"));
    assert(uses[1].startsWith("use Ash.OtherModule"));
  });

  it("should ignore non-use lines", function () {
    const content = `defmodule MyApp.User do\nuse Ash.Resource\nend`;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 1);
    assert(uses[0].startsWith("use Ash.Resource"));
  });

  it("should find Phoenix/LiveView use declarations", function () {
    const content = `
      defmodule MyAppWeb.UserLive do
        use MyAppWeb, :live_view
        use Ash.Resource
      end
    `;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 2);
    assert(uses[0].startsWith("use MyAppWeb"));
    assert(uses[1].startsWith("use Ash.Resource"));
  });

  it("should find ConnCase test declarations", function () {
    const content = `
      defmodule MyAppWeb.UserControllerTest do
        use MyAppWeb.ConnCase, async: true
        use Ash.Resource,
          otp_app: :myapp
      end
    `;
    const uses = findUseDeclarations(content);
    assert.strictEqual(uses.length, 2);
    assert(uses[0].includes("MyAppWeb.ConnCase, async: true"));
    assert(uses[1].includes("use Ash.Resource"));
    assert(uses[1].includes("otp_app: :myapp"));
  });
});
