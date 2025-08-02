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
    sections: [{ name: "resources", detailCount: 4 }],
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
