import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";
import * as fs from "fs";
import { DiagramSpec } from "../types/configurationRegistry";

/**
 * Invokes the appropriate Mix task to generate a diagram for the given resource file and diagram spec.
 * Returns a promise that resolves when the Mix task completes.
 */
export async function generateDiagramWithMix(
  resourceFilePath: string,
  diagramSpec: DiagramSpec
): Promise<void> {
  // Find project root by searching for mix.exs upwards
  function findMixProjectRoot(startDir: string): string | null {
    let dir = startDir;
    while (true) {
      const mixPath = path.join(dir, "mix.exs");
      if (fs.existsSync(mixPath)) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }
  return new Promise((resolve, reject) => {
    const startDir = path.dirname(resourceFilePath);
    const cwd = findMixProjectRoot(startDir) || startDir;
    // Get the diagram format from the extension setting
    const config = vscode.workspace.getConfiguration();
    const format = config.get<string>("ashStudio.diagramFormat", "plain");
    // Build the Mix command with the selected format
    const args = [
      diagramSpec.mixCommand,
      "--only",
      resourceFilePath,
      "--format",
      format,
    ];
    if (diagramSpec.type) {
      args.push("--type", diagramSpec.type);
    }
    let mix: ReturnType<typeof spawn>;
    try {
      mix = spawn("mix", args, { cwd });
    } catch (syncErr) {
      vscode.window.showErrorMessage(
        `Failed to start Mix: ${syncErr instanceof Error ? syncErr.message : String(syncErr)}`
      );
      reject(syncErr);
      return;
    }
    let stderr = "";
    let stdout = "";
    if (mix.stdout) {
      mix.stdout.on("data", data => {
        stdout += data.toString();
      });
    }
    if (mix.stderr) {
      mix.stderr.on("data", data => {
        stderr += data.toString();
      });
    }
    mix.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        vscode.window.showErrorMessage(
          `Mix task failed (exit code ${code}): ${stderr || stdout}`
        );
        reject(new Error(`Mix task failed with code ${code}: ${stderr}`));
      }
    });
    mix.on("error", (err: NodeJS.ErrnoException) => {
      if (err?.code === "ENOENT") {
        vscode.window.showErrorMessage(
          'Could not find the "mix" command. Please ensure Elixir and Mix are installed and available in your PATH.'
        );
      } else {
        vscode.window.showErrorMessage(
          `Error running Mix: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      reject(err);
    });
  });
}
