import { ModuleInterface } from "../moduleInterface";

const AshPaperTrail_Config: ModuleInterface = {
  displayName: "Ash Paper Trail",
  declarationPattern: "AshPaperTrail.Resource",
  dslBlocks: [
    {
      blockName: "paper_trail",
      children: [],
    },
  ],
  documentationLenses: {
    paper_trail: "https://hexdocs.pm/ash_paper_trail/readme.html",
  },
  diagramLenses: [],
};

export default AshPaperTrail_Config;
