import { ModuleInterface } from "./moduleInterface";

const AshPostgresConfig: ModuleInterface = {
  displayName: "Postgres",
  declarationPattern: "AshPostgres.DataLayer",
  dslBlocks: [
    {
      blockName: "postgres",
      doBlock: "required",
      groupChildren: false,
      children: [],
    },
  ],
  codeLenses: {
    paper_trail: "https://hexdocs.pm/ash_paper_trail/readme.html",
  },
};

export default AshPostgresConfig;
