import { ModuleConfiguration } from "../types/configurationRegistry";
// Using explicit path to avoid TypeScript resolution issues

const AshJason_Config: ModuleConfiguration = {
  displayName: "Jason",
  declarationPattern: "AshJason.Resource",
  dslBlocks: [
    {
      blockName: "jason",
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
  diagramLenses: [],
};

export default AshJason_Config;
