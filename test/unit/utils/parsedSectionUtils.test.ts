import { getContent } from "../../../src/utils/parsedSectionUtils";

const testCases = [
  {
    section: {
      name: "attributes",
      startingLocation: { line: 1, column: 1 },
      endingLocation: { line: 5, column: 1 },
      children: [],
    },
    source: [
      "attributes do",
      "  attribute :foo, :string",
      "  attribute :bar, :string",
      "  attribute :baz, :string",
      "end",
    ],
    expected: [
      "  attribute :foo, :string",
      "  attribute :bar, :string",
      "  attribute :baz, :string",
    ],
  },
  {
    section: {
      name: "attributes",
      startingLocation: { line: 1, column: 1 },
      endingLocation: { line: 2, column: 1 },
      children: [],
    },
    source: ["attributes do", "end"],
    expected: [],
  },
  {
    section: {
      name: "attributes",
      startingLocation: { line: 1, column: 1 },
      endingLocation: { line: 5, column: 1 },
      children: [],
    },
    source: [
      "attributes do",
      "  attribute :foo, :string",
      "  attribute :bar, :string",
      "  attribute :baz, :string",
      "end",
    ],
    expected: [
      "  attribute :foo, :string",
      "  attribute :bar, :string",
      "  attribute :baz, :string",
    ],
  },
];

describe("parsedSectionUtils.getContent", () => {
  testCases.forEach(({ section, source, expected }) => {
    it(`gets the content from the source`, () => {
      const actual = getContent(section, source);
      expect(actual).toEqual(expected);
    });
  });
});
