import { ModuleInterface } from "../moduleInterface";

const AshResourceConfig: ModuleInterface = {
  displayName: "Ash.Resource",
  declarationPattern: "Ash.Resource",
  dslBlocks: [
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
  ],
  codeLenses: {
    resource: "https://hexdocs.pm/ash/dsl-ash-resource.html",
    attributes: "https://hexdocs.pm/ash/dsl-ash-resource.html#attributes",
    calculations: "https://hexdocs.pm/ash/calculations.html",
    validations: "https://hexdocs.pm/ash/validations.html",
    actions: "https://hexdocs.pm/ash/actions.html",
  },
};

export default AshResourceConfig;
