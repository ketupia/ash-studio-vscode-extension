import { ParsedSection } from "../types/parser";

export function getContent(
  section: ParsedSection,
  sourceLines: string[]
): string[] {
  // ParsedLocation is 1-based; skip header, exclude 'end'
  const start = section.startingLocation.line; // skip header
  const end = section.endingLocation.line - 1; // exclude 'end'
  return sourceLines.slice(start, end);
}
