import { ModuleInterface } from "../types/configurationRegistry";

const AshAuthentication_Config: ModuleInterface = {
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
