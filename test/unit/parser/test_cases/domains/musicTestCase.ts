import Ash_Domain_Config from "../../../../../src/configurations/Ash.Domain.config";
import AshGraphql_Config from "../../../../../src/configurations/AshGraphql.config";
import AshJsonApi_Config from "../../../../../src/configurations/AshJsonApi.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/domains/music.ashexample",
  configs: [AshGraphql_Config, Ash_Domain_Config, AshJsonApi_Config],
  sections: [
    {
      name: "graphql",
      startingLocation: { line: 4, column: 3 },
      endingLocation: { line: 21, column: 6 },
    },
    {
      name: "json_api",
      startingLocation: { line: 23, column: 3 },
      endingLocation: { line: 40, column: 6 },
    },
    {
      name: "resources",
      startingLocation: { line: 46, column: 3 },
      endingLocation: { line: 102, column: 6 },
    },
  ],
} as TestCase;
