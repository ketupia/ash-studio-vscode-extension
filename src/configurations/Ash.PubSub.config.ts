import { ModuleConfiguration } from "../types/configurationRegistry";

const Ash_PubSub_Config: ModuleConfiguration = {
  displayName: "Ash PubSub",
  declarationPattern: "Ash.Notifier.PubSub",
  dslSections: [
    {
      name: "pub_sub",
      childPatterns: [],
    },
  ],
  diagramSpecs: [
    // ...existing code...
  ],
};

export default Ash_PubSub_Config;
