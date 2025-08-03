/**
 * @module UseDeclarationService
 *
 * Service for extracting 'use' declarations from Ash/Elixir source files.
 *
 * # Purpose
 * This service is responsible for identifying and extracting all `use` declarations within a given Elixir source file. In the context of the Ash Framework, `use` declarations are critical for module composition and extension, as they bring in macros and behaviors from Ash and related libraries.
 *
 * # Architectural Context
 * - This class is a pure logic module and does not depend on VS Code APIs.
 * - It is part of the parser subsystem (see `src/parser/`), which provides foundational parsing and extraction utilities for Ash-related code analysis.
 * - The results from this service are used by higher-level features such as section navigation, code lens, and sidebar views, enabling the extension to present accurate module relationships and dependencies to the user.
 *
 * # Responsibilities
 * - Accurately extract all `use` blocks, including those that span multiple lines or use bracket/argument continuations.
 * - Provide a simple, semantic API for retrieving these blocks as raw strings for further analysis or display.
 *
 * # Related Modules
 * - `blockExtractorService.ts`: For general block extraction logic.
 *
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
