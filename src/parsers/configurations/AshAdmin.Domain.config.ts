import { ModuleInterface } from "../moduleInterface";

const AshAdmin_Domain_Config: ModuleInterface = {
  displayName: "Ash Admin",
  declarationPattern: "AshAdmin.Domain",
  dslBlocks: [
    {
      blockName: "admin",
      children: [],
    },
  ],
  codeLenses: {
    admin: "https://hexdocs.pm/ash_admin/0.13.13/AshAdmin.Domain.html",
  },
};

export default AshAdmin_Domain_Config;
