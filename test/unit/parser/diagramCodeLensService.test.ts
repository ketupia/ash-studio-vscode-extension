import { DiagramCodeLensService } from "../../../src/parser/diagramCodeLensService";
import { BlockExtractorService } from "../../../src/parser/blockExtractorService";
import Ash_Domain_Config from "../../../src/configurations/Ash.Domain.config";
import Ash_Resource_Config from "../../../src/configurations/Ash.Resource.config";
import assert from "assert";
import fs from "fs";
import path from "path";

const exampleFileTestCases = [
  {
    file: "domains/music.ex",
    config: Ash_Domain_Config,
    codeLenses: [{ title: "Class" }, { title: "Entity Relationship" }],
  },
  {
    file: "resources/album.ex",
    config: Ash_Resource_Config,
    codeLenses: [{ title: "Policy Flowchart" }],
  },
];

exampleFileTestCases.forEach(({ file, config, codeLenses }) => {
  describe(`Diagram Code Lens Service for ${file}`, () => {
    it(`parses ${file} and finds expected codeLenses`, () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), "test/example_files", file),
        "utf8"
      );
      const blockExtractor = new BlockExtractorService();
      const blocks = blockExtractor.extractModules(source, [config]);
      const service = new DiagramCodeLensService(config);
      const lenses = service.getCodeLenses(blocks, file);
      codeLenses.forEach(({ title }) => {
        const lens = lenses.find(l => l.title.endsWith(title));
        assert.ok(lens, `Should find code lens: ${title}`);
      });
    });
  });
});
