import { ModuleConfiguration } from "../types/configurationRegistry";
import {
  CodeLensService,
  ParsedSection,
  DiagramCodeLensEntry,
} from "../types/parser";

/**
 * Provides code lenses for diagram sections in Ash modules.
 * Each code lens entry includes a full DiagramSpec for use by the showDiagram handler.
 *
 * @remarks
 * This service is used by the ModuleParser to generate CodeLensEntry objects for each
 * diagram-enabled section in a module, enabling quick navigation and diagram preview.
 *
 * @param moduleConfig - The module configuration containing diagramSpecs.
 */
export class DiagramCodeLensService implements CodeLensService {
  constructor(private moduleConfig: ModuleConfiguration) {}

  /**
   * Generate CodeLensEntry objects for all diagram-enabled sections in the given sections list.
   *
   * @param sections - The parsed sections of the module.
   * @param filePath - The file path of the resource/module.
   * @returns An array of CodeLensEntry objects, each with a full DiagramSpec.
   */
  getCodeLenses(
    sections: ParsedSection[],
    filePath?: string
  ): DiagramCodeLensEntry[] {
    if (!this.moduleConfig.diagramSpecs) return [];
    const lenses: DiagramCodeLensEntry[] = [];
    for (const section of sections) {
      for (const spec of this.moduleConfig.diagramSpecs) {
        if (section.name === spec.keyword) {
          const entry: DiagramCodeLensEntry = {
            startingLocation: {
              line: section.startingLocation.line,
              column: 0,
            },
            title: `🖼️ ${spec.name}`,
            command: "ash-studio.showDiagram",
            target: filePath || "",
            source: this.moduleConfig.displayName,
            diagramSpec: spec,
          };
          lenses.push(entry);
        }
      }
    }
    return lenses;
  }
}
