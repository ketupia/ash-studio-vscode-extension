// Configuration registry for Ash module configurations
// Exports a function to get all available configurations

import AshAdmin_Domain_Config from "./AshAdmin.Domain.config";
import AshAdmin_Resource_Config from "./AshAdmin.Resource.config";
import AshAuthentication_Config from "./AshAuthentication.config";
import Ash_Domain_Config from "./Ash.Domain.config";
import Ash_PubSub_Config from "./Ash.PubSub.config";
import Ash_Resource_Config from "./Ash.Resource.config";
import AshPaperTrail_Config from "./AshPaperTrail.config";
import AshPostgres_Config from "./AshPostgres.config";
import {
  ModuleInterface,
  ConfigurationRegistryInterface,
} from "../types/configurationRegistry";

class ConfigurationRegistry implements ConfigurationRegistryInterface {
  getAll(): ModuleInterface[] {
    return [
      AshAdmin_Domain_Config,
      AshAdmin_Resource_Config,
      AshAuthentication_Config,
      Ash_Domain_Config,
      Ash_PubSub_Config,
      Ash_Resource_Config,
      AshPaperTrail_Config,
      AshPostgres_Config,
      // Add new configurations here as they are created
    ];
  }
}

export const configurationRegistry = new ConfigurationRegistry();
