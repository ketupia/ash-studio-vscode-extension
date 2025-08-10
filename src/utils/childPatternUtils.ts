import { ChildPattern } from "../types/configurationRegistry";

/**
 * Check if a line matches a specific pattern and extract relevant information
 *
 * @param line - The line to check
 * @param pattern - The pattern to match against
 * @returns Match information if found, null otherwise
 */
export function findPatternInLine(
  pattern: ChildPattern,
  line: string
): { name: string } | null {
  // Build regex: ^keyword\b\s*(namePattern)?
  let regexStr = `^${pattern.keyword}\\b`;
  if (pattern.namePattern) {
    regexStr += `\\s*${pattern.namePattern}`;
  }
  const regex = new RegExp(regexStr);
  const match = line.match(regex);
  if (!match) {
    return null;
  }
  let name = "";
  if (pattern.namePattern && match[1]) {
    name = match[1].trim();
  }
  return {
    name,
  };
}
