import { ModuleInterface } from "../types/configurationRegistry";

/**
 * Service for identifying which ModuleInterface configurations are present in use declarations.
 */
export class ModuleMatcherService {
  /**
   * Takes raw use declaration strings and matches them against available configs.
   */
  identifyConfiguredModules(
    useDeclarations: string[],
    availableConfigs: ModuleInterface[]
  ): ModuleInterface[] {
    const matchedConfigs: ModuleInterface[] = [];
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
