import fs from "fs";
import path from "path";
import "jest-extended";
import { SectionParser } from "../../../src/parser/sectionParser";
import musicTestCase from "./test_cases/domains/musicTestCase";
import albumTestCase from "./test_cases/resources/albumTestCase";
import artistTestCase from "./test_cases/resources/artistTestCase";
import ashJasonTestCase from "./test_cases/resources/ashJasonTestCase";
import ashNeo4jTestCase from "./test_cases/resources/ashNeo4jTestCase";
import ashOutstandingTestCase from "./test_cases/resources/ashOutstandingTestCase";
import ashObanTestCase from "./test_cases/resources/ashObanTestCase";

describe("SectionParser", () => {
  const testCases = [
    musicTestCase,
    albumTestCase,
    artistTestCase,
    ashJasonTestCase,
    ashNeo4jTestCase,
    ashOutstandingTestCase,
    ashObanTestCase,
  ];

  testCases.forEach(testCase => {
    it(`parses ${testCase.file} and finds expected sections`, () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), testCase.file),
        "utf8"
      );

      const parsedSections = new SectionParser().parseSections(
        source,
        testCase.configs
      );

      expect(parsedSections.length).toBe(testCase.sections.length);

      testCase.sections.forEach(expectedSection => {
        const parsedSection = parsedSections.find(
          s => s.name === expectedSection.name
        );
        expect(parsedSection).toBeDefined();
        if (parsedSection) {
          if (expectedSection.startingLocation) {
            expect(parsedSection.startingLocation).toEqual(
              expectedSection.startingLocation
            );
          }
          if (expectedSection.endingLocation) {
            expect(parsedSection.endingLocation).toEqual(
              expectedSection.endingLocation
            );
          }
          if (expectedSection.children) {
            const expectedSet = new Set(
              expectedSection.children.map(
                d => `${expectedSection.name} ${d.keyword} ${d.name}`
              )
            );
            const actualSet = new Set(
              (parsedSection.children || []).map(
                d => `${parsedSection.name} ${d.keyword} ${d.name}`
              )
            );
            const missing = [...expectedSet].filter(x => !actualSet.has(x));
            const extra = [...actualSet].filter(x => !expectedSet.has(x));
            expect(missing).toHaveLength(0);
            expect(extra).toHaveLength(0);
          }
        }
      });
    });
  });
});
