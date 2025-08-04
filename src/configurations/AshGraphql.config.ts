import { ModuleInterface } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshGraphql_Config: ModuleInterface = {
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
