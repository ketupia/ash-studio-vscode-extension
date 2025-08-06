import { ModuleConfiguration } from "../types/configurationRegistry";

const Ash_Domain_Config: ModuleConfiguration = {
  displayName: "Ash Domain",
  declarationPattern: "Ash.Domain",
  dslBlocks: [
    {
      blockName: "resources",
      childPatterns: [
        {
          keyword: "resource",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
        },
      ],
    },
  ],
  diagramLenses: [
    {
      name: "Class",
      keyword: "resources",
      mixCommand: "ash.generate_resource_diagrams",
      filePattern: "-mermaid-class-diagram.(mmd|svg|png|pdf)",
      type: "class",
    },
    {
      name: "Entity Relationship",
      keyword: "resources",
      mixCommand: "ash.generate_resource_diagrams",
      filePattern: "-mermaid-er-diagram.(mmd|svg|png|pdf)",
      type: "er",
    },
  ],
};

export default Ash_Domain_Config;
