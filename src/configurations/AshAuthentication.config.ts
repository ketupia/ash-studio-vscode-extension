import { ModuleConfiguration } from "../types/configurationRegistry";

const AshAuthentication_Config: ModuleConfiguration = {
  displayName: "Ash Authentication",
  declarationPattern: "AshAuthentication",
  dslBlocks: [
    {
      blockName: "authentication",
      childPatterns: [
        {
          keyword: "password",
          namePattern: "(:\\w+|\\w+)",
        },
        {
          keyword: "magic_link",
        },
      ],
    },
  ],
  diagramLenses: [],
};

export default AshAuthentication_Config;
