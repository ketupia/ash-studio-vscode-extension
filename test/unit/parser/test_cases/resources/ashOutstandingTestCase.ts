import Ash_Resource_Config from "../../../../../src/configurations/Ash.Resource.config";
import AshOutstanding_Config from "../../../../../src/configurations/AshOutstanding.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/resources/ash_outstanding_service.ashexample",
  configs: [Ash_Resource_Config, AshOutstanding_Config],
  sections: [
    {
      name: "outstanding",
      startingLocation: { line: 7, column: 3 },
      endingLocation: { line: 9, column: 6 },
    },
    {
      name: "actions",
      startingLocation: { line: 11, column: 3 },
      endingLocation: { line: 25, column: 6 },
    },
    {
      name: "attributes",
      startingLocation: { line: 27, column: 3 },
      endingLocation: { line: 33, column: 6 },
    },
    {
      name: "relationships",
      startingLocation: { line: 35, column: 3 },
      endingLocation: { line: 37, column: 6 },
    },
  ],
} as TestCase;
