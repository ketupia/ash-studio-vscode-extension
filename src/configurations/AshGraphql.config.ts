import { ModuleConfiguration } from "../types/configurationRegistry";

const AshGraphql_Config: ModuleConfiguration = {
  displayName: "GraphQL",
  declarationPattern: "AshGraphql.Resource",
  dslSections: [
    {
      name: "graphql",
      childPatterns: [],
    },
  ],
  diagramSpecs: [],
};

export default AshGraphql_Config;
