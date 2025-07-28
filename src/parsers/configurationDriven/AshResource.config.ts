import { ModuleInterface } from "./moduleInterface";

const AshResourceConfig: ModuleInterface = {
  displayName: "Ash.Resource",
  declarationPattern: "Ash.Resource",
  dslBlocks: [
    {
      blockName: "attributes",
      doBlock: "required",
      groupChildren: true,
      children: [
        {
          blockName: "attribute",
          doBlock: "optional",
          namePattern: "^w+",
        },
      ],
    },
    {
      blockName: "actions",
      doBlock: "required",
      children: [
        {
          blockName: "create",
          doBlock: "required",
          namePattern: "^:?(\\w+)",
        },
        {
          blockName: "read",
          doBlock: "optional",
          namePattern: "^:?(\\w+)",
        },
        {
          blockName: "update",
          doBlock: "optional",
          namePattern: "^:?(\\w+)",
        },
        {
          blockName: "destroy",
          doBlock: "optional",
          namePattern: "^:?(\\w+)",
        },
        {
          blockName: "action",
          doBlock: "optional",
          namePattern: "^:?(\\w+)",
        },
      ],
    },
  ],
  codeLenses: {
    validate: "https://hexdocs.pm/ash/validations.html",
  },
};

export default AshResourceConfig;
