import assert from "assert";
import { BlockExtractorService } from "../../../src/parser/blockExtractorService";
import AshNeo4j_Config from "../../../src/configurations/AshNeo4j.config";

import fs from "fs";
import path from "path";

const exampleFileTestCases = [
  {
    file: "resources/ash_neo4j_from_docs.ex",
    config: AshNeo4j_Config,
    sections: [
      {
        name: "neo4j",
        detailCount: 0,
        startLine: undefined,
        endLine: undefined,
      },
    ],
  },
  {
    file: "resources/ash_neo4j_tag.ex",
    config: AshNeo4j_Config,
    sections: [
      {
        name: "neo4j",
        detailCount: 0,
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
