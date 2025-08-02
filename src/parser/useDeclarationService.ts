/**
 * Service for finding 'use' declarations in Ash/Elixir source files.
 */
export class UseDeclarationService {
  /**
   * Finds all 'use' declarations in the source file.
   * Returns an array of raw use declaration blocks (may be multiline).
   * Handles comma-continuation and bracket-continuation properly.
   */
  findUseDeclarations(source: string): string[] {
    const lines = source.split("\n");
    const useDeclarations: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const useMatch = line.match(/^\s*use\s+([A-Za-z0-9_.]+)/);
      if (useMatch) {
        let useBlock = line;
        let currentLineIndex = i;
        const bracketStack: string[] = [];
        const updateBracketStack = (text: string) => {
          for (const char of text) {
            if (char === "[" || char === "(" || char === "{") {
              bracketStack.push(char);
            } else if (char === "]" || char === ")" || char === "}") {
              bracketStack.pop();
            }
          }
        };
        updateBracketStack(line);
        while (
          currentLineIndex < lines.length &&
          (useBlock.trim().endsWith(",") || bracketStack.length > 0)
        ) {
          currentLineIndex++;
          if (currentLineIndex < lines.length) {
            const nextLine = lines[currentLineIndex];
            useBlock += "\n" + nextLine;
            updateBracketStack(nextLine);
            if (bracketStack.length === 0 && !nextLine.trim().endsWith(",")) {
              break;
            }
          }
        }
        useDeclarations.push(useBlock.trim());
        i = currentLineIndex;
      }
    }
    return useDeclarations;
  }
}
