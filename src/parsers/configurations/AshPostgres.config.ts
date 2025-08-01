import { ModuleInterface } from "../moduleInterface";
// Using explicit path to avoid TypeScript resolution issues

const AshPostgres_Config: ModuleInterface = {
  displayName: "Postgres",
  declarationPattern: "AshPostgres.DataLayer",
  dslBlocks: [
    {
      blockName: "postgres",
      children: [],
    },
  ],
  documentationLenses: {
    postgres: "https://hexdocs.pm/ash_paper_trail/readme.html",
  },
  diagramLenses: [],
};

export default AshPostgres_Config;
