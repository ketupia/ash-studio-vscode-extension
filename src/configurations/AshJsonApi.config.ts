import { ModuleConfiguration } from "../types/configurationRegistry";

const AshJsonApi_Config: ModuleConfiguration = {
  displayName: "JSON Api",
  declarationPattern: "AshJsonApi.Resource",
  dslSections: [
    {
      name: "json_api",
      childPatterns: [],
    },
  ],
  diagramSpecs: [],
};

export default AshJsonApi_Config;
