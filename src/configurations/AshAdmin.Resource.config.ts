import { ModuleConfiguration } from "../types/configurationRegistry";

const AshAdmin_Resource_Config: ModuleConfiguration = {
  displayName: "Ash Admin",
  declarationPattern: "AshAdmin.Resource",
  dslSections: [
    {
      name: "admin_resource",
      childPatterns: [],
    },
  ],
  diagramSpecs: [],
};

export default AshAdmin_Resource_Config;
