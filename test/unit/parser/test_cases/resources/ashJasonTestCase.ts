import Ash_Resource_Config from "../../../../../src/configurations/Ash.Resource.config";
import AshJason_Config from "../../../../../src/configurations/AshJason.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/resources/ash_jason_from_docs.ashexample",
  configs: [Ash_Resource_Config, AshJason_Config],
  sections: [
    {
      name: "jason",
      startingLocation: { line: 7, column: 3 },
      endingLocation: { line: 50, column: 6 },
    },
  ],
} as TestCase;
