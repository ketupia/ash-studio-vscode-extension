import fs from "fs";
import path from "path";
import { SectionParser } from "../../../src/parser/sectionParser";
import { DefinitionEntryService } from "../../../src/parser/definitionEntryService";
import musicTestCase from "./test_cases/domains/musicTestCase";
import albumTestCase from "./test_cases/resources/albumTestCase";
import artistTestCase from "./test_cases/resources/artistTestCase";
import { ParsedSection, ParsedChild } from "../../../src/types/parser";
import "jest-extended";

// Helper to flatten all children from all sections
function getAllChildren(sections: ParsedSection[]): ParsedChild[] {
  return sections.flatMap((section: ParsedSection) => section.children || []);
}

describe("DefinitionEntryService", () => {
  const testCases = [musicTestCase, albumTestCase, artistTestCase];

  testCases.forEach(testCase => {
    it(`definition entries match child startingLocation for ${testCase.file}`, () => {
      const source = fs.readFileSync(
        path.join(process.cwd(), testCase.file),
        "utf8"
      );
      const parsedSections = new SectionParser().parseSections(
        source,
        testCase.configs
      );
      const definitionEntries = DefinitionEntryService.getDefinitionEntries(
        parsedSections,
        testCase.configs
      );
      const allChildren: ParsedChild[] = getAllChildren(parsedSections);

      definitionEntries.forEach(entry => {
        // Find a child with matching name and startingLocation
        const matchingChild = allChildren.find(
          (child: ParsedChild) =>
            child.name === entry.name &&
            child.startingLocation.line === entry.startingLocation.line &&
            child.startingLocation.column === entry.startingLocation.column
        );
        expect(matchingChild).toBeDefined();
      });
    });
  });
});
