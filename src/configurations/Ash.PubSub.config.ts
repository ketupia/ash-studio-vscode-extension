import { ModuleInterface } from "../types/configurationRegistry";

const Ash_PubSub_Config: ModuleInterface = {
  displayName: "Ash PubSub",
  declarationPattern: "Ash.Notifier.PubSub",
  dslBlocks: [
    {
      blockName: "pub_sub",
      children: [
        // {
        //   blockName: "publish",
        //   namePattern: "(:\\w+|\\w+)",
        // },
        // {
        //   blockName: "publish_all",
        //   namePattern: "(:\\w+|\\w+)",
        // },
      ],
    },
  ],
  documentationLenses: {
    pub_sub: "https://hexdocs.pm/ash/Ash.Notifier.PubSub.html",
  },
  diagramLenses: [
    // ...existing code...
  ],
};

export default Ash_PubSub_Config;
