import { ModuleConfiguration } from "../types/configurationRegistry";

/**
 * Service for identifying which ModuleConfiguration configurations are present in use declarations.
 */
export class ModuleMatcherService {
  /**
   * Takes raw use declaration strings and matches them against available configs.
   */
  identifyConfiguredModules(
    useDeclarations: string[],
    availableConfigs: ModuleConfiguration[]
  ): ModuleConfiguration[] {
    const matchedConfigs: ModuleConfiguration[] = [];
    for (const useDeclaration of useDeclarations) {
      for (const config of availableConfigs) {
        if (useDeclaration.includes(config.declarationPattern)) {
          if (
            !matchedConfigs.find(
              c => c.declarationPattern === config.declarationPattern
            )
          ) {
            matchedConfigs.push(config);
          }
        }
      }
    }
    return matchedConfigs;
  }
}
