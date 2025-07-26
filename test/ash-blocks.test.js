const { assertParses } = require("./parser-helpers");

describe("Ash DSL Blocks", function () {
  it("should parse postgres blocks", function () {
    assertParses(
      'defmodule Test do\n  postgres do\n    table "pets"\n  end\nend',
      "Postgres block with table statement"
    );
  });

  it("should parse empty postgres blocks", function () {
    assertParses(
      "defmodule Test do\n  postgres do\n  end\nend",
      "Empty postgres block"
    );
  });

  it("should parse actions blocks", function () {
    assertParses(
      "defmodule Test do\n  actions do\n    defaults [:read, :destroy]\n  end\nend",
      "Actions block with defaults"
    );
  });

  it("should parse attributes blocks", function () {
    assertParses(
      "defmodule Test do\n  attributes do\n    attribute :name, :string\n  end\nend",
      "Attributes block"
    );
  });

  it("should parse relationships blocks", function () {
    assertParses(
      "defmodule Test do\n  relationships do\n    belongs_to :owner, User\n  end\nend",
      "Relationships block"
    );
  });

  it("should parse multiple DSL blocks", function () {
    assertParses(
      'defmodule Test do\n  postgres do\n    table "pets"\n  end\n  actions do\n    defaults [:read]\n  end\nend',
      "Multiple DSL blocks"
    );
  });

  it("should parse nested blocks in complex resource", function () {
    assertParses(
      'defmodule Test do\n  use Ash.Resource\n  postgres do\n    table "pets"\n  end\n  actions do\n    defaults [:read, :destroy]\n  end\nend',
      "Complex resource with multiple blocks"
    );
  });
});
