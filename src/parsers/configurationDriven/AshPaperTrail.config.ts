import { ModuleInterface } from "./moduleInterface";

const AshPaperTrailConfig: ModuleInterface = {
  displayName: "Paper Trail",
  declarationPattern: "AshPaperTrail.Resource",
  dslBlocks: [
    {
      blockName: "paper_trail",
      doBlock: "required",
      groupChildren: false,
      children: [],
    },
  ],
  codeLenses: {
    paper_trail: "https://hexdocs.pm/ash_paper_trail/readme.html",
  },
};

export default AshPaperTrailConfig;
