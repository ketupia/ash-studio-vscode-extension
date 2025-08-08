import { ModuleConfiguration } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshJason_Config: ModuleConfiguration = {
  displayName: "Jason",
  declarationPattern: "AshJason.Resource",
  dslSections: [
    {
      name: "jason",
      childPatterns: [
        // {
        //   keyword: "pick",
        // },
        // {
        //   keyword: "merge",
        // },
        // {
        //   keyword: "rename",
        // },
        // {
        //   keyword: "order",
        // },
        // {
        //   keyword: "customize",
        // },
      ],
    },
  ],
  diagramSpecs: [],
};

export default AshJason_Config;
