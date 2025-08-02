import { ModuleInterface } from "../types/configurationRegistry";

const Ash_PubSub_Config: ModuleInterface = {
  displayName: "Ash PubSub",
  declarationPattern: "Ash.Notifier.PubSub",
  dslBlocks: [
    {
      blockName: "pub_sub",
      childPatterns: [
        // {
        //   keyword: "publish",
        //   namePattern: "(:\\w+|\\w+)",
        // },
        // {
        //   keyword: "publish_all",
        //   namePattern: "(:\\w+|\\w+)",
        // },
      ],
    },
  ],
  diagramLenses: [
    // ...existing code...
  ],
};

export default Ash_PubSub_Config;
