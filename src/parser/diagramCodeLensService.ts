import { ModuleInterface } from "../types/configurationRegistry";
import {
  ICodeLensService,
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
 * @param moduleConfig - The module configuration containing diagramLenses.
 */
export class DiagramCodeLensService implements ICodeLensService {
  constructor(private moduleConfig: ModuleInterface) {}

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
    if (!this.moduleConfig.diagramLenses) return [];
    const lenses: DiagramCodeLensEntry[] = [];
    for (const section of sections) {
      for (const spec of this.moduleConfig.diagramLenses) {
        if (section.section === spec.keyword) {
          lenses.push({
            line: section.startLine,
            character: 0,
            title: `🖼️ ${spec.name}`,
            command: "ash-studio.showDiagram",
            target: filePath || "",
            source: this.moduleConfig.displayName,
            range: { startLine: section.startLine, endLine: section.endLine },
            diagramSpec: spec,
          });
        }
      }
    }
    return lenses;
  }
}
