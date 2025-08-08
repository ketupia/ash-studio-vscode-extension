import {
  ModuleConfiguration,
  namePatterns,
} from "../types/configurationRegistry";

const AshAuthentication_Config: ModuleConfiguration = {
  displayName: "Ash Authentication",
  declarationPattern: "AshAuthentication",
  dslSections: [
    {
      name: "authentication",
      childPatterns: [
        {
          keyword: "password",
          namePattern: namePatterns.not_boolean_name,
        },
        {
          keyword: "magic_link",
        },
      ],
    },
  ],
  diagramSpecs: [],
};

export default AshAuthentication_Config;
