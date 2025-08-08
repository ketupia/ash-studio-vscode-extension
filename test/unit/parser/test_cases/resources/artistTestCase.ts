import Ash_Resource_Config from "../../../../../src/configurations/Ash.Resource.config";
import AshGraphql_Config from "../../../../../src/configurations/AshGraphql.config";
import AshJsonApi_Config from "../../../../../src/configurations/AshJsonApi.config";
import AshPostgres_Config from "../../../../../src/configurations/AshPostgres.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/resources/artist.ashexample",
  configs: [
    AshGraphql_Config,
    AshPostgres_Config,
    Ash_Resource_Config,
    AshJsonApi_Config,
  ],
  sections: [
    {
      name: "graphql",
      startingLocation: { line: 9, column: 3 },
      endingLocation: { line: 19, column: 6 },
    },
    {
      name: "json_api",
      startingLocation: { line: 21, column: 3 },
      endingLocation: { line: 25, column: 6 },
    },
    {
      name: "postgres",
      startingLocation: { line: 27, column: 3 },
      endingLocation: { line: 34, column: 6 },
    },
    {
      name: "resource",
      startingLocation: { line: 36, column: 3 },
      endingLocation: { line: 38, column: 6 },
    },
    {
      name: "actions",
      startingLocation: { line: 40, column: 3 },
      endingLocation: { line: 67, column: 6 },
    },
    {
      name: "policies",
      startingLocation: { line: 69, column: 3 },
      endingLocation: { line: 86, column: 6 },
    },
    {
      name: "changes",
      startingLocation: { line: 88, column: 3 },
      endingLocation: { line: 91, column: 6 },
    },
    {
      name: "attributes",
      startingLocation: { line: 93, column: 3 },
      endingLocation: { line: 112, column: 6 },
    },
    {
      name: "relationships",
      startingLocation: { line: 114, column: 3 },
      endingLocation: { line: 129, column: 6 }, // Adjusted to match actual end
    },
    {
      name: "calculations",
      startingLocation: { line: 131, column: 3 },
      endingLocation: { line: 137, column: 6 },
    },
    {
      name: "aggregates",
      startingLocation: { line: 139, column: 3 },
      endingLocation: { line: 153, column: 6 },
    },
  ],
} as TestCase;
