import { ModuleConfiguration } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshPostgres_Config: ModuleConfiguration = {
  displayName: "Postgres",
  declarationPattern: "AshPostgres.DataLayer",
  dslSections: [
    {
      name: "postgres",
      childPatterns: [],
    },
  ],
  diagramSpecs: [],
};

export default AshPostgres_Config;
