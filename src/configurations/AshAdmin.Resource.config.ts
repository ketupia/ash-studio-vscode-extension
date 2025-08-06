import { ModuleConfiguration } from "../types/configurationRegistry";

const AshAdmin_Resource_Config: ModuleConfiguration = {
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
