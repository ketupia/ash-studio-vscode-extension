import { ModuleConfiguration } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshNeo4j_Config: ModuleConfiguration = {
  displayName: "Neo4j",
  declarationPattern: "AshNeo4j.DataLayer",
  dslSections: [
    {
      name: "neo4j",
      childPatterns: [
        // {
        //   keyword: "label",
        // },
        // {
        //   keyword: "relate",
        // },
        // {
        //   keyword: "guard",
        // },
        // {
        //   keyword: "translate",
        // },
        // {
        //   keyword: "skip",
        // },
      ],
    },
  ],
  diagramSpecs: [],
};

export default AshNeo4j_Config;
