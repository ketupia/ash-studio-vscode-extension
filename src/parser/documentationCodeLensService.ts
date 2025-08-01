import { CodeLensEntry } from "../types/parser";
import { ModuleInterface } from "../types/configurationRegistry";

export class DocumentationCodeLensService {
  extractDocumentationLenses(
    source: string,
    matchedModules: ModuleInterface[]
  ): CodeLensEntry[] {
    const codeLenses: CodeLensEntry[] = [];
    const lines = source.split("\n");
    for (const module of matchedModules) {
      if (module.documentationLenses) {
        for (const [keyword, url] of Object.entries(
          module.documentationLenses
        )) {
          let searchPos = 0;
          let foundPos: number;
          while ((foundPos = source.indexOf(keyword, searchPos)) !== -1) {
            const prevChar = foundPos > 0 ? source.charAt(foundPos - 1) : " ";
            const nextChar =
              foundPos + keyword.length < source.length
                ? source.charAt(foundPos + keyword.length)
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
              const target: string =
                typeof url === "string" ? url : String(url);
              codeLenses.push({
                line,
                character,
                title: `📘 ${module.displayName} Docs`,
                command: "ash-studio.openDocumentation",
                target,
                source: module.displayName,
                range: { startLine: line, endLine: line },
              });
            }
            searchPos = foundPos + keyword.length;
          }
        }
      }
    }
    return codeLenses;
  }
}
