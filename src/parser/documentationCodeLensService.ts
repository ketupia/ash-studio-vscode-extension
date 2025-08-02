import type {
  ICodeLensService,
  ParsedSection,
  CodeLensEntry,
} from "../types/parser";
import type { ModuleInterface } from "../types/configurationRegistry";

export class DocumentationCodeLensService implements ICodeLensService {
  constructor(private moduleConfig: ModuleInterface) {}

  getCodeLenses(sections: ParsedSection[], filePath?: string): CodeLensEntry[] {
    if (!this.moduleConfig.documentationLenses) return [];
    const lenses: CodeLensEntry[] = [];
    for (const section of sections) {
      const docUrl = this.moduleConfig.documentationLenses[section.section];
      if (docUrl) {
        lenses.push({
          line: section.startLine,
          character: 0,
          title: `📘 ${section.section}`,
          command: "ash-studio.openDocumentation",
          target: docUrl,
          source: this.moduleConfig.displayName,
          range: { startLine: section.startLine, endLine: section.endLine },
        });
      }
    }
    return lenses;
  }
}
