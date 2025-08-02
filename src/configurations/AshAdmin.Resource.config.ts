import { ModuleInterface } from "../types/configurationRegistry";

const AshAdmin_Resource_Config: ModuleInterface = {
  displayName: "Ash Admin",
  declarationPattern: "AshAdmin.Resource",
  dslBlocks: [
    {
      blockName: "admin",
      childPatterns: [],
    },
  ],
  diagramLenses: [],
};

export default AshAdmin_Resource_Config;
