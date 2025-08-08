import { ModuleConfiguration } from "../types/configurationRegistry";

const AshPaperTrail_Config: ModuleConfiguration = {
  displayName: "Ash Paper Trail",
  declarationPattern: "AshPaperTrail.Resource",
  dslSections: [
    {
      name: "paper_trail",
      childPatterns: [],
    },
  ],
  diagramSpecs: [],
};

export default AshPaperTrail_Config;
