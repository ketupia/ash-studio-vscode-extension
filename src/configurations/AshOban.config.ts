import {
  ModuleConfiguration,
  namePatterns,
} from "../types/configurationRegistry";

const AshOban_Config: ModuleConfiguration = {
  displayName: "Ash Oban",
  declarationPattern: "AshOban",
  dslSections: [
    {
      name: "oban",
      childPatterns: [
        {
          keyword: "trigger",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
      ],
    },
  ],
};

export default AshOban_Config;
