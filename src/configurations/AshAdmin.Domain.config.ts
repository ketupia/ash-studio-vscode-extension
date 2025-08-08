import { ModuleConfiguration } from "../types/configurationRegistry";

const AshAdmin_Domain_Config: ModuleConfiguration = {
  displayName: "Ash Admin",
  declarationPattern: "AshAdmin.Domain",
  dslSections: [
    {
      name: "admin_domain",
      childPatterns: [],
    },
  ],
  diagramSpecs: [],
};

export default AshAdmin_Domain_Config;
