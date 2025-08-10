import fs from "fs";
import path from "path";
import "jest-extended";
import { ChildParser } from "../../../src/parser/childParser";
import { ChildPattern } from "../../../src/types/configurationRegistry";
import musicTestCase from "./test_cases/domains/musicTestCase";
import albumTestCase from "./test_cases/resources/albumTestCase";
import artistTestCase from "./test_cases/resources/artistTestCase";
import ashJasonTestCase from "./test_cases/resources/ashJasonTestCase";
import ashObanTestCase from "./test_cases/resources/ashObanTestCase";
import { getContent } from "../../../src/utils/parsedSectionUtils";

describe("ChildParser", () => {
  const testCases = [
    albumTestCase,
    artistTestCase,
    musicTestCase,
    ashJasonTestCase,
    ashObanTestCase,
  ];
  const parser = new ChildParser();

  testCases.forEach(testCase => {
    const source = fs.readFileSync(
      path.join(process.cwd(), testCase.file),
      "utf8"
    );
    const lines = source.split("\n");

    testCase.sections.forEach(expectedSection => {
      if (!expectedSection.children || expectedSection.children.length === 0)
        return;
      it(`parses children for ${testCase.file} section ${expectedSection.name}`, () => {
        // Find the configuration section for this expectedSection
        let childPatterns: ChildPattern[] = [];
        for (const moduleConfig of testCase.configs) {
          if (moduleConfig.dslSections) {
            const configSection = moduleConfig.dslSections.find(
              s => s.name === expectedSection.name
            );
            if (configSection && configSection.childPatterns) {
              childPatterns = configSection.childPatterns;
              break;
            }
          }
        }

        const content = getContent(expectedSection, lines);

        const result = parser.findChildren(
          content,
          childPatterns,
          expectedSection.startingLocation.line
        );

        // Compare sets of expected and actual children
        const expectedSet = new Set(
          expectedSection.children.map(d => `${d.keyword} ${d.name}`)
        );

        const actualSet = new Set(result.map(r => `${r.keyword} ${r.name}`));

        const missing = [...expectedSet].filter(x => !actualSet.has(x));
        const extra = [...actualSet].filter(x => !expectedSet.has(x));

        expect(missing).toHaveLength(0);
        expect(extra).toHaveLength(0);
      });
    });
  });
});
