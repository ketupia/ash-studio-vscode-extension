import { ModuleInterface } from "../moduleInterface";

const Ash_Domain_Config: ModuleInterface = {
  displayName: "Ash Domain",
  declarationPattern: "Ash.Domain",
  dslBlocks: [
    {
      blockName: "resources",
      children: [
        {
          blockName: "resource",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
          children: [],
        },
      ],
    },
  ],
  codeLenses: {
    resources: "https://hexdocs.pm/ash/domains.html",
  },
};

export default Ash_Domain_Config;
