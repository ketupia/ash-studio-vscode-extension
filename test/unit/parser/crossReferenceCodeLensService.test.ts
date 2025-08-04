import assert from "assert";
import { CrossReferenceCodeLensService } from "../../../src/parser/crossReferenceCodeLensService";
import Ash_Resource_Config from "../../../src/configurations/Ash.Resource.config";
import Ash_Domain_Config from "../../../src/configurations/Ash.Domain.config";
import { BlockExtractorService } from "../../../src/parser/blockExtractorService";
import fs from "fs";
import path from "path";
import { ModuleInterface } from "../../../src/types/configurationRegistry";

const userSource = fs.readFileSync(
  path.join(process.cwd(), "test/example_files/resources/user.ex"),
  "utf8"
);

type ExpectedLens = {
  line: number;
  targetLine: number;
  titleIncludes: string;
};

type Scenario = {
  name: string;
  source: string;
  configs: ModuleInterface[];
  expected: ExpectedLens[];
};

const scenarios: Scenario[] = [
  {
    name: "returns an empty array when there are no cross references in config",
    source: `defmodule MyApp.Domain do\n  use Ash.Domain\nend`,
    configs: [Ash_Domain_Config],
    expected: [],
  },
  {
    name: "returns an empty array when there are no matching details",
    source: `defmodule MyApp.Resource do\n  use Ash.Resource\n  code_interface do\n    define(:foo)\n  end\n  actions do\n    action :bar do\n    end\n  end\nend`,
    configs: [Ash_Resource_Config],
    expected: [],
  },
  {
    name: "finds cross references from code_interface to actions",
    source: userSource,
    configs: [Ash_Resource_Config],
    expected: [
      {
        line: 71,
        targetLine: 114,
        titleIncludes: "actions",
      },
    ],
  },
];

describe("CrossReferenceCodeLensService (scenario-driven)", () => {
  const blockExtractor = new BlockExtractorService();
  const service = new CrossReferenceCodeLensService();

  scenarios.forEach(({ name, source, configs, expected }) => {
    it(name, () => {
      const sections = blockExtractor.extractModules(source, configs);
      const result = service.getCrossReferenceCodeLenses(sections, configs);
      assert.strictEqual(
        result.length,
        expected.length,
        `Expected ${expected.length} code lens entries, got ${result.length}`
      );
      expected.forEach(exp => {
        const found = result.find(
          lens =>
            lens.line === exp.line &&
            lens.targetLine === exp.targetLine &&
            lens.title.includes(exp.titleIncludes)
        );
        assert(
          found,
          `Expected to find code lens with line ${exp.line}, targetLine ${exp.targetLine}, and title including '${exp.titleIncludes}'`
        );
      });
    });
  });
});
