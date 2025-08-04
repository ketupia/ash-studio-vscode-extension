import { ModuleInterface } from "../types/configurationRegistry";

const Ash_Resource_Config: ModuleInterface = {
  displayName: "Ash.Resource",
  declarationPattern: "Ash.Resource",
  dslBlocks: [
    {
      blockName: "actions",
      childPatterns: [
        {
          keyword: "create",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "read",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "update",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "destroy",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "action",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "aggregates",
      childPatterns: [
        {
          keyword: "count",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "exists",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "fist",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "sum",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "list",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "max",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "min",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "avg",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "custom",
        },
      ],
    },
    {
      blockName: "attributes",
      childPatterns: [
        {
          keyword: "attribute",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "calculations",
      childPatterns: [
        {
          keyword: "calculate",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "changes",
      childPatterns: [
        {
          keyword: "change",
        },
      ],
    },
    {
      blockName: "code_interface",
      childPatterns: [
        {
          keyword: "define",
          namePattern: "(:\\w+|\\w+)",
          crossReference: {
            blockName: "actions",
          },
        },
      ],
    },
    {
      blockName: "identities",
      childPatterns: [
        {
          keyword: "identity",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "policies",
      childPatterns: [
        {
          keyword: "bypass",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
        },
        {
          keyword: "policy",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
        },
      ],
    },
    {
      blockName: "preparations",
      childPatterns: [
        {
          keyword: "prepare",
        },
      ],
    },
    {
      blockName: "relationships",
      childPatterns: [
        {
          keyword: "belongs_to",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "has_many",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "has_one",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "many_to_many",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "resource",
      childPatterns: [],
    },
    {
      blockName: "validations",
      childPatterns: [
        {
          keyword: "validate",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
  ],
  diagramLenses: [
    {
      name: "Policy Flowchart",
      keyword: "policies",
      mixCommand: "ash.generate_policy_charts",
      filePattern: "-policy-flowchart.(mmd|svg|png|pdf)",
    },
  ],
};

export default Ash_Resource_Config;
