import { ModuleInterface } from "../moduleInterface";

const AshPubSubConfig: ModuleInterface = {
  displayName: "PubSub",
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
  codeLenses: {
    pub_sub: "https://hexdocs.pm/ash/Ash.Notifier.PubSub.html",
  },
};

export default AshPubSubConfig;
