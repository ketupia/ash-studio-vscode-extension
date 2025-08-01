import * as fs from "fs";
import * as path from "path";
import { DiagramSpec } from "../types/configurationRegistry";

/**
 * Checks if the diagram file exists and is current (newer than the resource file).
 * Returns true if the diagram exists and is up to date, false otherwise.
 */
export function diagramExistsAndIsCurrent(
  resourceFilePath: string,
  diagramSpec: DiagramSpec
): boolean {
  const resourceDir = path.dirname(resourceFilePath);
  const resourceBase = path.basename(
    resourceFilePath,
    path.extname(resourceFilePath)
  );
  // Prepend the root file name to the diagramSpec.filePattern
  const filePattern = new RegExp(resourceBase + diagramSpec.filePattern);
  const resourceStat = fs.statSync(resourceFilePath);
  // Find matching diagram files in the resource directory
  const files = fs.readdirSync(resourceDir);
  for (const file of files) {
    if (filePattern.test(file)) {
      const diagramPath = path.join(resourceDir, file);
      const diagramStat = fs.statSync(diagramPath);
      if (diagramStat.mtimeMs >= resourceStat.mtimeMs) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns the theoretical/expected diagram file path for a resource and diagram spec.
 * This does not check for existence, just returns the expected file name (first match).
 */
export function getTheoreticalDiagramFilePath(
  resourceFilePath: string,
  diagramSpec: DiagramSpec
): string {
  const resourceDir = path.dirname(resourceFilePath);
  const resourceBase = path.basename(
    resourceFilePath,
    path.extname(resourceFilePath)
  );
  // Use the filePattern to construct the expected file name
  // If the pattern is e.g. ".*-policy-flowchart.(mmd|svg|png|pdf)", default to .mmd
  // Remove the ".*" and group, just use the base and the first extension
  const extMatch = diagramSpec.filePattern.match(/\.\(([^)]+)\)/i);
  let ext = "mmd";
  if (extMatch && extMatch[1]) {
    // If group, take first
    ext = extMatch[1].split("|")[0];
  }
  // Remove any ".*" prefix and group from filePattern for the suffix
  let suffix = diagramSpec.filePattern
    .replace(/^\.\*-?/, "-")
    .replace(/\(.*\)/, "")
    .replace(/\.[^\.]+$/, "");
  if (suffix.endsWith("$")) suffix = suffix.slice(0, -1);
  // Remove any trailing period from suffix to avoid double dots
  suffix = suffix.replace(/\.$/, "");
  // Compose the file name
  const fileName = `${resourceBase}${suffix}.${ext}`;
  return path.join(resourceDir, fileName);
}
