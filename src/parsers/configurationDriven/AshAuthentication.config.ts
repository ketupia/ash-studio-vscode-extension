import { ModuleInterface } from "./moduleInterface";

const AshPaperTrailConfig: ModuleInterface = {
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
              blockName: "magic_link"
            },
          ],
        }
      ],
    },
  ],
  codeLenses: {
    authentication: "https://hexdocs.pm/ash_authentication/readme.html",
  },
};

export default AshPaperTrailConfig;
