import { ParsedSection, DefinitionEntry } from "../types/parser";
import {
  ModuleConfiguration,
  ChildPattern,
} from "../types/configurationRegistry";

/**
 * Service to assemble DefinitionEntry objects from parsed sections and module configurations.
 */
export class DefinitionEntryService {
  /**
   * Collects all DefinitionEntry objects from parsed sections and module configs.
   * @param sections Parsed sections from the parser
   * @param moduleConfigs Array of module configurations
   */
  static getDefinitionEntries(
    sections: ParsedSection[],
    moduleConfigs: ModuleConfiguration[]
  ): DefinitionEntry[] {
    const entries: DefinitionEntry[] = [];
    for (const section of sections) {
      // Find the module config and DSL section for this section
      const moduleConfig = moduleConfigs.find(m =>
        m.dslSections.some(b => b.name === section.name)
      );
      if (!moduleConfig) continue;
      const dslSection = moduleConfig.dslSections.find(
        b => b.name === section.name
      );
      if (!dslSection || !dslSection.childPatterns) continue;
      for (const child of section.children) {
        // Find the matching child pattern for this detail
        const childPattern: ChildPattern | undefined =
          dslSection.childPatterns.find(
            p => p.keyword === child.keyword && p.isDefinition === true
          );
        if (childPattern && child.name) {
          entries.push({
            name: child.name,
            startingLocation: child.startingLocation,
            semantics: {
              sectionName: section.name,
            },
          });
        }
      }
    }
    return entries;
  }
}
