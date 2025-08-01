import { ModuleInterface } from "../moduleInterface";

const Ash_Resource_Config: ModuleInterface = {
  displayName: "Ash.Resource",
  declarationPattern: "Ash.Resource",
  dslBlocks: [
    {
      blockName: "actions",
      children: [
        {
          blockName: "create",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "read",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "update",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "destroy",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "action",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "aggregates",
      children: [
        {
          blockName: "count",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "exists",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "fist",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "sum",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "list",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "max",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "min",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "avg",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "custom",
        },
      ],
    },
    {
      blockName: "attributes",
      children: [
        {
          blockName: "attribute",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "calculations",
      children: [
        {
          blockName: "calculate",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "changes",
      children: [
        {
          blockName: "change",
        },
      ],
    },
    {
      blockName: "code_interface",
      children: [
        {
          blockName: "define",
        },
      ],
    },
    {
      blockName: "identities",
      children: [
        {
          blockName: "identity",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "policies",
      children: [
        {
          blockName: "bypass",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
        },
        {
          blockName: "policy",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
        },
      ],
    },
    {
      blockName: "preparations",
      children: [
        {
          blockName: "prepare",
        },
      ],
    },
    {
      blockName: "relationships",
      children: [
        {
          blockName: "belongs_to",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "has_many",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "has_one",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          blockName: "many_to_many",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
    {
      blockName: "resource",
      children: [],
    },
    {
      blockName: "validations",
      children: [
        {
          blockName: "validate",
          namePattern: "(:\\w+|\\w+)",
        },
      ],
    },
  ],
  codeLenses: {
    actions: "https://hexdocs.pm/ash/actions.html",
    aggregates: "https://hexdocs.pm/ash/aggregates.html",
    attributes: "https://hexdocs.pm/ash/attributes.html",
    calculations: "https://hexdocs.pm/ash/calculations.html",
    changes: "https://hexdocs.pm/ash/changes.html",
    code_interface: "https://hexdocs.pm/ash/code-interfaces.html",
    identities: "https://hexdocs.pm/ash/identities.html",
    preparations: "https://hexdocs.pm/ash/preparations.html",
    policies: "https://hexdocs.pm/ash/policies.html",
    relationships: "https://hexdocs.pm/ash/relationships.html",
    resource: "https://hexdocs.pm/ash/dsl-ash-resource.html",
    validations: "https://hexdocs.pm/ash/validations.html",
  },
  diagrams: [
    {
      name: "Policy Flowchart",
      keyword: "policies",
      command: "ash.generate_policy_charts",
      filePattern: "-policy-flowchart.(mmd|svg|png|pdf)",
    },
  ],
};

export default Ash_Resource_Config;
