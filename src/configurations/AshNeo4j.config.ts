import { ModuleInterface } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshNeo4j_Config: ModuleInterface = {
  displayName: "Neo4j",
  declarationPattern: "AshNeo4j.DataLayer",
  dslBlocks: [
    {
      blockName: "neo4j",
      childPatterns: [
        {
          keyword: "label",
        },
        {
          keyword: "relate",
        },
        {
          keyword: "guard",
        },
        {
          keyword: "translate",
        },
        {
          keyword: "skip",
        },

      ],
    },
  ],
  diagramLenses: [],
};

export default AshNeo4j_Config;
