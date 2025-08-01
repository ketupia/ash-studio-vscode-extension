import { CodeLensEntry } from "../types/parser";
import { ModuleInterface } from "../types/configurationRegistry";
import { getTheoreticalDiagramFilePath } from "../utils/diagramUtils";

export class DiagramCodeLensService {
  extractDiagramLenses(
    source: string,
    matchedModules: ModuleInterface[],
    filePath?: string
  ): CodeLensEntry[] {
    const codeLenses: CodeLensEntry[] = [];
    const lines = source.split("\n");
    for (const module of matchedModules) {
      if (module.diagramLenses) {
        for (const diagramSpec of module.diagramLenses) {
          let searchPos = 0;
          let foundPos: number;
          while (
            (foundPos = source.indexOf(diagramSpec.keyword, searchPos)) !== -1
          ) {
            const prevChar = foundPos > 0 ? source.charAt(foundPos - 1) : " ";
            const nextChar =
              foundPos + diagramSpec.keyword.length < source.length
                ? source.charAt(foundPos + diagramSpec.keyword.length)
                : " ";
            const isWholeWord =
              !/[a-zA-Z0-9_]/.test(prevChar) && !/[a-zA-Z0-9_]/.test(nextChar);
            if (isWholeWord) {
              let line = 1;
              let currentPos = 0;
              while (currentPos < foundPos && line - 1 < lines.length) {
                currentPos += lines[line - 1].length + 1;
                if (currentPos <= foundPos) {
                  line++;
                }
              }
              const lineStart = currentPos - lines[line - 1].length - 1;
              const character = foundPos - lineStart;
              let diagramFilePath: string | undefined = undefined;
              if (filePath) {
                diagramFilePath = getTheoreticalDiagramFilePath(
                  filePath,
                  diagramSpec
                );
              }
              if (diagramFilePath) {
                codeLenses.push({
                  line,
                  character,
                  title: `🖼️ ${diagramSpec.name}`,
                  command: "ash-studio.showDiagram",
                  target: diagramFilePath,
                  source: module.displayName,
                  range: { startLine: line, endLine: line },
                });
              }
            }
            searchPos = foundPos + diagramSpec.keyword.length;
          }
        }
      }
    }
    return codeLenses;
  }
}
