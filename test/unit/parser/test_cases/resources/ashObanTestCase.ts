import Ash_Resource_Config from "../../../../../src/configurations/Ash.Resource.config";
import AshOban_Config from "../../../../../src/configurations/AshOban.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/resources/ash_oban_from_docs.example",
  configs: [Ash_Resource_Config, AshOban_Config],
  sections: [
    {
      name: "oban",
      startingLocation: { line: 4, column: 3 },
      endingLocation: { line: 17, column: 6 },
      children: [
        {
          keyword: "trigger",
          name: ":process",
          startingLocation: { line: 7, column: 7 },
        },
      ],
    },
  ],
} as TestCase;
