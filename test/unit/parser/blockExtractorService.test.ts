import assert from "assert";
import { BlockExtractorService } from "../../../src/parser/blockExtractorService";
import Ash_Resource_Config from "../../../src/configurations/Ash.Resource.config";
import Ash_Domain_Config from "../../../src/configurations/Ash.Domain.config";
import fs from "fs";
import path from "path";

const exampleFileTestCases = [
  {
    file: "domains/music.ex",
    config: Ash_Domain_Config,
    sections: [
      {
        name: "resources",
        detailCount: 4,
        startLine: 46,
        endLine: undefined,
      },
    ],
  },
  {
    file: "resources/album.ex",
    config: Ash_Resource_Config,
    sections: [
      {
        name: "attributes",
        detailCount: 3,
        startLine: undefined,
        endLine: undefined,
      },
      {
        name: "actions",
        detailCount: 3,
        startLine: undefined,
        endLine: undefined,
      },
      {
        name: "policies",
        detailCount: 4,
        startLine: undefined,
        endLine: undefined,
      },
    ],
  },
  {
    file: "resources/user.ex",
    config: Ash_Resource_Config,
    sections: [
      {
        name: "attributes",
        detailCount: 4,
        startLine: undefined,
        endLine: undefined,
      },
      {
        name: "actions",
        detailCount: 11,
        startLine: undefined,
        endLine: undefined,
      },
      {
        name: "policies",
        detailCount: 3,
        startLine: undefined,
        endLine: undefined,
      },
      {
        name: "relationships",
        detailCount: 2,
        startLine: undefined,
        endLine: undefined,
      },
      {
        name: "code_interface",
        detailCount: 1,
        startLine: undefined,
        endLine: undefined,
      },
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

      sections.forEach(({ name, detailCount, startLine, endLine }) => {
        const section = result.find(s => s.section === name);
        assert.ok(section, `Should find section: ${name}`);
        if (detailCount !== undefined) {
          assert.strictEqual(
            section.details.length,
            detailCount,
            `Section ${name} should have ${detailCount} details`
          );
        }
        if (startLine !== undefined) {
          assert.strictEqual(
            section.startLine,
            startLine,
            `Section ${name} should start at line ${startLine}`
          );
        }
        if (endLine !== undefined) {
          assert.strictEqual(
            section.endLine,
            endLine,
            `Section ${name} should end at line ${endLine}`
          );
        }
      });
    });
  });
});
