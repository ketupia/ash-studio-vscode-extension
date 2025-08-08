import { ModuleConfiguration } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshOutstanding_Config: ModuleConfiguration = {
  displayName: "Outstanding",
  declarationPattern: "AshOutstanding.Resource",
  dslSections: [
    {
      name: "outstanding",
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
  diagramSpecs: [],
};

export default AshOutstanding_Config;
