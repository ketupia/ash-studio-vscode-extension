import type {
  ICodeLensService,
  ParsedSection,
  CodeLensEntry,
} from "../types/parser";
import type { ModuleInterface } from "../types/configurationRegistry";

export class DiagramCodeLensService implements ICodeLensService {
  constructor(private moduleConfig: ModuleInterface) {}

  getCodeLenses(sections: ParsedSection[], filePath?: string): CodeLensEntry[] {
    if (!this.moduleConfig.diagramLenses) return [];
    const lenses: CodeLensEntry[] = [];
    for (const section of sections) {
      for (const spec of this.moduleConfig.diagramLenses) {
        if (section.section === spec.keyword) {
          lenses.push({
            line: section.startLine,
            character: 0,
            title: `🖼️ ${spec.name}`,
            command: spec.command,
            target: filePath || "",
            source: this.moduleConfig.displayName,
            range: { startLine: section.startLine, endLine: section.endLine },
          });
        }
      }
    }
    return lenses;
  }
}
