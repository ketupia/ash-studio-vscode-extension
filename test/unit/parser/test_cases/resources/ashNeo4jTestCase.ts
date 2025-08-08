import Ash_Resource_Config from "../../../../../src/configurations/Ash.Resource.config";
import AshNeo4j_Config from "../../../../../src/configurations/AshNeo4j.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/resources/ash_neo4j_tag.ashexample",
  configs: [Ash_Resource_Config, AshNeo4j_Config],
  sections: [
    {
      name: "neo4j",
      startingLocation: { line: 7, column: 3 },
      endingLocation: { line: 12, column: 6 },
    },
    {
      name: "actions",
      startingLocation: { line: 14, column: 3 },
      endingLocation: { line: 25, column: 6 },
    },
    {
      name: "attributes",
      startingLocation: { line: 27, column: 3 },
      endingLocation: { line: 31, column: 6 },
    },
    {
      name: "relationships",
      startingLocation: { line: 33, column: 3 },
      endingLocation: { line: 38, column: 6 },
    },
  ],
} as TestCase;
