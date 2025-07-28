import { ModuleInterface } from "./moduleInterface";

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
    calculations: "https://hexdocs.pm/ash/calculations.html",
    validations: "https://hexdocs.pm/ash/validations.html",
  },
};

export default AshResourceConfig;
