import { ModuleInterface } from "../moduleInterface";

const Ash_Domain_Config: ModuleInterface = {
  displayName: "Ash Domain",
  declarationPattern: "Ash.Domain",
  dslBlocks: [
    {
      blockName: "resources",
      children: [
        {
          blockName: "resource",
          namePattern:
            "([^\\s]+(?:\\([^\\)]*\\))?(?:\\s+[^\\s]+)*?)(?:\\s+do)?",
          children: [],
        },
      ],
    },
  ],
  documentationLenses: {
    resources: "https://hexdocs.pm/ash/domains.html",
  },
  diagramLenses: [
    {
      name: "Class",
      keyword: "resources",
      command: "ash.generate_resource_diagrams",
      filePattern: "-mermaid-class-diagram.(mmd|svg|png|pdf)",
      type: "class",
    },
    {
      name: "Entity Resource",
      keyword: "resources",
      command: "ash.generate_resource_diagrams",
      filePattern: "-mermaid-entity-diagram.(mmd|svg|png|pdf)",
      type: "er",
    },
  ],
};

export default Ash_Domain_Config;
