import fs from "fs";
import path from "path";
import "jest-extended";
import { ChildParser } from "../../../src/parser/childParser";
import { ChildPattern } from "../../../src/types/configurationRegistry";
import musicTestCase from "./test_cases/domains/musicTestCase";
import albumTestCase from "./test_cases/resources/albumTestCase";
import artistTestCase from "./test_cases/resources/artistTestCase";
import ashJasonTestCase from "./test_cases/resources/ashJasonTestCase";

describe("ChildParser", () => {
  const testCases = [
    albumTestCase,
    artistTestCase,
    musicTestCase,
    ashJasonTestCase,
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
        // Only pass lines inside the section section to the child parser
        const start = expectedSection.startingLocation.line;
        const end = expectedSection.endingLocation.line - 1;
        const sectionLines = lines.slice(start, end);

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

        const result = parser.findChildren(sectionLines, childPatterns, 0);

        // Compare sets of expected and actual children
        const expectedSet = new Set(
          expectedSection.children.map(d => `${d.keyword} ${d.name}`)
        );
        const actualSet = new Set(result.map(r => `${r.keyword} ${r.name}`));
        const missing = [...expectedSet].filter(x => !actualSet.has(x));
        const extra = [...actualSet].filter(x => !expectedSet.has(x));
        expect(missing).toHaveLength(0);
        expect(extra).toHaveLength(0);

        // compare children
        expectedSection.children.forEach(expectedChild => {
          const actualChild = result.find(
            r =>
              r.keyword === expectedChild.keyword &&
              r.name === expectedChild.name
          );
          expect(actualChild).toBeTruthy();
          if (actualChild) {
            const sectionOffset = expectedSection.startingLocation.line + 1;
            const adjustedActualLocation = {
              line: actualChild.startingLocation.line + sectionOffset,
              column: actualChild.startingLocation.column,
            };
            expect(adjustedActualLocation).toEqual(
              expectedChild.startingLocation
            );
          }
        });
      });
    });
  });
});
