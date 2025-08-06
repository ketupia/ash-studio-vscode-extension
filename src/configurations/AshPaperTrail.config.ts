import { ModuleConfiguration } from "../types/configurationRegistry";

const AshPaperTrail_Config: ModuleConfiguration = {
  displayName: "Ash Paper Trail",
  declarationPattern: "AshPaperTrail.Resource",
  dslBlocks: [
    {
      blockName: "paper_trail",
      childPatterns: [],
    },
  ],
  diagramLenses: [],
};

export default AshPaperTrail_Config;
