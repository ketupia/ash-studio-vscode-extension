import { ModuleInterface } from "../types/configurationRegistry";

const AshPaperTrail_Config: ModuleInterface = {
  displayName: "Ash Paper Trail",
  declarationPattern: "AshPaperTrail.Resource",
  dslBlocks: [
    {
      blockName: "paper_trail",
      childPatterns: [],
    },
  ],
  documentationLenses: {
    paper_trail: "https://hexdocs.pm/ash_paper_trail/readme.html",
  },
  diagramLenses: [],
};

export default AshPaperTrail_Config;
