import { ModuleConfiguration } from "../types/configurationRegistry";

const AshJsonApi_Config: ModuleConfiguration = {
  displayName: "JSON Api",
  declarationPattern: "AshJsonApi.Resource",
  dslBlocks: [
    {
      blockName: "json_api",
      childPatterns: [],
    },
  ],
  diagramLenses: [],
};

export default AshJsonApi_Config;
