import {
  ModuleConfiguration,
  namePatterns,
} from "../types/configurationRegistry";

const Ash_Domain_Config: ModuleConfiguration = {
  displayName: "Ash Domain",
  declarationPattern: "Ash.Domain",
  dslSections: [
    {
      name: "resources",
      childPatterns: [
        {
          keyword: "resource",
          namePattern: namePatterns.everything_up_to_do,
        },
      ],
    },
  ],
  diagramSpecs: [
    {
      name: "Class",
      keyword: "resources",
      mixCommand: "ash.generate_resource_diagrams",
      filePattern: "-mermaid-class-diagram.mmd",
      type: "class",
    },
    {
      name: "Entity Relationship",
      keyword: "resources",
      mixCommand: "ash.generate_resource_diagrams",
      filePattern: "-mermaid-er-diagram.mmd",
      type: "er",
    },
  ],
};

export default Ash_Domain_Config;
