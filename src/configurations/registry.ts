// Configuration registry for Ash module configurations
// Exports a function to get all available configurations

import AshAdmin_Domain_Config from "./AshAdmin.Domain.config";
import AshAdmin_Resource_Config from "./AshAdmin.Resource.config";
import AshAuthentication_Config from "./AshAuthentication.config";
import Ash_Domain_Config from "./Ash.Domain.config";
import Ash_PubSub_Config from "./Ash.PubSub.config";
import Ash_Resource_Config from "./Ash.Resource.config";
import AshGraphql_Config from "./AshGraphql.config";
import AshJsonApi_Config from "./AshJsonApi.config";
import AshPaperTrail_Config from "./AshPaperTrail.config";
import AshPostgres_Config from "./AshPostgres.config";
import {
  ModuleConfiguration,
  ConfigurationRegistry,
} from "../types/configurationRegistry";
import AshJason_Config from "./AshJason.config";
import AshNeo4j_Config from "./AshNeo4j.config";
import AshOutstanding_Config from "./AshOutstanding.config";

class ConfigurationRegistryImpl implements ConfigurationRegistry {
  getAll(): ModuleConfiguration[] {
    return [
      AshAdmin_Domain_Config,
      AshAdmin_Resource_Config,
      AshAuthentication_Config,
      Ash_Domain_Config,
      Ash_PubSub_Config,
      Ash_Resource_Config,
      AshGraphql_Config,
      AshJsonApi_Config,
      AshPaperTrail_Config,
      AshPostgres_Config,
      AshJason_Config,
      AshNeo4j_Config,
      AshOutstanding_Config,
      // Add new configurations here as they are created
    ];
  }
}

export default new ConfigurationRegistryImpl();
