import { ModuleInterface } from "../types/configurationRegistry";

const AshAuthentication_Config: ModuleInterface = {
  displayName: "Ash Authentication",
  declarationPattern: "AshAuthentication",
  dslBlocks: [
    {
      blockName: "authentication",
      children: [
        {
          blockName: "strategies",
          children: [
            {
              blockName: "password",
              namePattern: "(:\\w+|\\w+)",
            },
            {
              blockName: "magic_link",
            },
          ],
        },
      ],
    },
  ],
  documentationLenses: {
    authentication: "https://hexdocs.pm/ash_authentication/readme.html",
  },
  diagramLenses: [],
};

export default AshAuthentication_Config;
