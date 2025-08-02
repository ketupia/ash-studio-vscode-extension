import { ModuleInterface } from "../types/configurationRegistry";

const AshAdmin_Domain_Config: ModuleInterface = {
  displayName: "Ash Admin",
  declarationPattern: "AshAdmin.Domain",
  dslBlocks: [
    {
      blockName: "admin",
      childPatterns: [],
    },
  ],
  diagramLenses: [],
};

export default AshAdmin_Domain_Config;
