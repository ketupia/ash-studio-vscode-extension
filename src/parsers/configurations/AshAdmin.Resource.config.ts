import { ModuleInterface } from "../moduleInterface";

const AshAdmin_Resource_Config: ModuleInterface = {
  displayName: "Ash Admin",
  declarationPattern: "AshAdmin.Resource",
  dslBlocks: [
    {
      blockName: "admin",
      children: [],
    },
  ],
  documentationLenses: {
    admin: "https://hexdocs.pm/ash_admin/0.13.13/AshAdmin.Resource.html",
  },
  diagramLenses: [],
};

export default AshAdmin_Resource_Config;
