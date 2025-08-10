import { namePatterns } from "../../../src/types/configurationRegistry";
import { findPatternInLine } from "../../../src/utils/childPatternUtils";

describe("findPatternInLine", () => {
  const testCases = [
    {
      line: "trigger :process do",
      pattern: { keyword: "trigger", namePattern: namePatterns.primitive_name },
      expected_name: ":process",
    },
    {
      line: "triggers do",
      pattern: { keyword: "trigger", namePattern: namePatterns.primitive_name },
      expected_name: undefined,
    },
    {
      line: "attribute :name, :string",
      pattern: {
        keyword: "attribute",
        namePattern: namePatterns.primitive_name,
      },
      expected_name: ":name",
    },
    {
      line: "action process",
      pattern: { keyword: "action", namePattern: namePatterns.primitive_name },
      expected_name: "process",
    },
    {
      line: "identities :unique_album_names_per_artist, [:name, :artist_id],",
      pattern: {
        keyword: "identities",
        namePattern: namePatterns.primitive_name,
      },
      expected_name: ":unique_album_names_per_artist",
    },
    {
      line: "bypass actor_attribute_equals(:role, :admin) do",
      pattern: {
        keyword: "bypass",
        namePattern: namePatterns.everything_up_to_do,
      },
      expected_name: "actor_attribute_equals(:role, :admin)",
    },
    {
      line: "policy action_type(:read) do",
      pattern: {
        keyword: "policy",
        namePattern: namePatterns.everything_up_to_do,
      },
      expected_name: "action_type(:read)",
    },
  ];

  testCases.forEach(({ line, pattern, expected_name }) => {
    it(`parses name "${expected_name}" from line "${line}"`, () => {
      const result = findPatternInLine(pattern, line);
      if (expected_name === undefined) {
        expect(result).toBeNull();
      } else {
        expect(result?.name).toBe(expected_name);
      }
    });
  });
});
