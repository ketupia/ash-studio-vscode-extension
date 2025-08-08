import "jest-extended";
import Ash_Domain_Config from "../../../src/configurations/Ash.Domain.config";
import Ash_Resource_Config from "../../../src/configurations/Ash.Resource.config";
import fs from "fs";
import path from "path";
import { moduleParser } from "../../../src/parser/moduleParser";

const exampleFileTestCases = [
  {
    file: "domains/music.ashexample",
    config: Ash_Domain_Config,
    codeLenses: [{ title: "Class" }, { title: "Entity Relationship" }],
  },
  {
    file: "resources/album.ashexample",
    config: Ash_Resource_Config,
    codeLenses: [{ title: "Policy Flowchart" }],
  },
];

exampleFileTestCases.forEach(({ file, codeLenses }) => {
  describe(`Diagram Code Lens Service for ${file}`, () => {
    it(`parses ${file} and finds expected codeLenses`, () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), "test/example_files", file),
        "utf8"
      );
      const result = moduleParser.parse(source);
      const lensTitles = result.diagramCodeLenses.map(lens => lens.title);
      codeLenses.forEach(({ title }) => {
        expect(lensTitles.some(lensTitle => lensTitle.endsWith(title))).toBe(
          true
        );
      });
    });
  });
});
