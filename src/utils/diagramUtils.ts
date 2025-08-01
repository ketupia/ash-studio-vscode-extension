import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { DiagramSpec } from "../parsers/moduleInterface";

/**
 * Invokes the appropriate Mix task to generate a diagram for the given resource file and diagram spec.
 * Returns a promise that resolves when the Mix task completes.
 */
export async function generateDiagramWithMix(
  resourceFilePath: string,
  diagramSpec: DiagramSpec,
  workspaceFolder?: vscode.WorkspaceFolder
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Determine the working directory (project root)
    const cwd = workspaceFolder?.uri.fsPath || path.dirname(resourceFilePath);
    // Get the diagram format from the extension setting
    const config = vscode.workspace.getConfiguration();
    const format = config.get<string>("ashStudio.diagramFormat", "plain");
    // Build the Mix command with the selected format
    const args = [
      diagramSpec.command,
      "--only",
      resourceFilePath,
      "--format",
      format,
    ];
    const mix = spawn("mix", args, { cwd });
    let stderr = "";
    // mix.stdout.on("data", data => {
    //   // Optionally, log or process stdout here if needed
    // });
    mix.stderr.on("data", data => {
      stderr += data.toString();
    });
    mix.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Mix task failed with code ${code}: ${stderr}`));
      }
    });
    mix.on("error", err => {
      reject(err);
    });
  });
}

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
