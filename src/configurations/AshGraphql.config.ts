import { ModuleConfiguration } from "../types/configurationRegistry";

const AshGraphql_Config: ModuleConfiguration = {
  displayName: "GraphQL",
  declarationPattern: "AshGraphql.Resource",
  dslBlocks: [
    {
      blockName: "graphql",
      childPatterns: [],
    },
  ],
  diagramLenses: [],
};

export default AshGraphql_Config;
