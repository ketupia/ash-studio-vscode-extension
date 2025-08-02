import { BlockIdentifierService } from "../../../src/parser/blockIdentifierService";
import assert from "assert";

describe("BlockIdentifierService", () => {
  const service = new BlockIdentifierService();

  it("finds the end of a simple do...end block", () => {
    const src = `foo do\n  bar\nend`;
    const start = src.indexOf("do");
    const endIdx = service.findEndOfBlock(src, start);
    assert.strictEqual(src.substring(start, endIdx), "do\n  bar\nend");
  });

  it("handles nested do...end blocks", () => {
    const src = `foo do\n  bar do\n    baz\n  end\nend`;
    const start = src.indexOf("do");
    const endIdx = service.findEndOfBlock(src, start);
    assert.strictEqual(
      src.substring(start, endIdx),
      "do\n  bar do\n    baz\n  end\nend"
    );
  });

  it("ignores do/end in strings", () => {
    const src = `foo do\n  s = "do end"\n  bar\nend`;
    const start = src.indexOf("do");
    const endIdx = service.findEndOfBlock(src, start);
    assert.strictEqual(
      src.substring(start, endIdx),
      'do\n  s = "do end"\n  bar\nend'
    );
  });

  it("returns -1 if no end found", () => {
    const src = `foo do\n  bar`;
    const start = src.indexOf("do");
    const endIdx = service.findEndOfBlock(src, start);
    assert.strictEqual(endIdx, -1);
  });

  it("handles multiple top-level blocks", () => {
    const src = `foo do\n  bar\nend\nbaz do\n  qux\nend`;
    const start1 = src.indexOf("do");
    const end1 = service.findEndOfBlock(src, start1);
    assert.strictEqual(src.substring(start1, end1), "do\n  bar\nend");
    const start2 = src.indexOf("do", end1);
    const end2 = service.findEndOfBlock(src, start2);
    assert.strictEqual(src.substring(start2, end2), "do\n  qux\nend");
  });

  it("finds the start of a block by name", () => {
    const src = `foo do\n  bar\nend\n\nattributes do\n  attribute :name, :string\nend`;
    const idx = service.findBlockStart(src, "attributes");
    assert.ok(idx !== -1, "Should find the start of the attributes block");
    assert.strictEqual(src.substring(idx, idx + 13), "attributes do");
  });

  it("finds the start of a block with params", () => {
    const src = `actions do\n  update :foo do\n    bar\n  end\nend`;
    const idx = service.findBlockStart(src, "actions");
    assert.ok(idx !== -1, "Should find the start of the actions block");
    assert.strictEqual(src.substring(idx, idx + 10), "actions do");
  });

  it("returns -1 if block not found", () => {
    const src = `foo do\n  bar\nend`;
    const idx = service.findBlockStart(src, "attributes");
    assert.strictEqual(idx, -1);
  });
});
