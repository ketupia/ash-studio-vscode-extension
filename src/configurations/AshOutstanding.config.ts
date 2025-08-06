import { ModuleConfiguration } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshOutstanding_Config: ModuleConfiguration = {
  displayName: "Outstanding",
  declarationPattern: "AshOutstanding.Resource",
  dslBlocks: [
    {
      blockName: "outstanding",
      childPatterns: [
        // {
        //   keyword: "expect",
        // },
        // {
        //   keyword: "customize",
        // },
      ],
    },
  ],
  diagramLenses: [],
};

export default AshOutstanding_Config;
