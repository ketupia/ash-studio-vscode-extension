import * as path from "path";
import { spawn } from "child_process";
import * as fs from "fs";
import { DiagramSpec } from "../types/configurationRegistry";
// getGeneratedDiagramFilePath moved here from diagramUtils.ts
export function getGeneratedDiagramFilePath(
  resourceFilePath: string,
  diagramSpec: DiagramSpec
): string {
  const resourceDir = path.dirname(resourceFilePath);
  const resourceBase = path.basename(
    resourceFilePath,
    path.extname(resourceFilePath)
  );
  let suffix = diagramSpec.filePattern || "";

  suffix = suffix.trim();

  const fileName = `${resourceBase}${suffix}`;
  return path.join(resourceDir, fileName);
}

// Helper: find project root containing mix.exs
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

// Helper: run mix with constructed args, resolve when process exits successfully
function runMixCommand(cwd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let mix: ReturnType<typeof spawn>;
    try {
      const isWindows = process.platform === "win32";
      mix = spawn("mix", args, { cwd, shell: isWindows });
    } catch (syncErr) {
      // Fail fast if spawn throws synchronously
      reject(syncErr instanceof Error ? syncErr : new Error(String(syncErr)));
      return;
    }
    let stderr = "";
    let stdout = "";
    mix.stdout!.on("data", data => {
      stdout += data.toString();
    });
    mix.stderr!.on("data", data => {
      stderr += data.toString();
    });
    mix.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`Mix task failed with code ${code}: ${stderr || stdout}`)
        );
      }
    });
    mix.on("error", (err: NodeJS.ErrnoException) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });
  });
}

// Hardcode Mix output to 'plain' (.mmd) to guarantee a consistent Mermaid text payload
// for the webview, simplify CLI args and testing, and avoid unsupported/unsafe formats.
// Helper: prepare args and cwd for the diagram mix command and invoke runMixCommand
function runMixForDiagram(
  resourceFilePath: string,
  diagramSpec: DiagramSpec
): Promise<void> {
  const startDir = path.dirname(resourceFilePath);
  const cwd = findMixProjectRoot(startDir) || startDir;
  const args = [
    diagramSpec.mixCommand,
    "--only",
    resourceFilePath,
    "--format",
    "plain",
  ];
  if (diagramSpec.type) {
    args.push("--type", diagramSpec.type);
  }

  return runMixCommand(cwd, args);
}

// Type guard for NodeJS.ErrnoException-like objects
function isErrnoException(obj: unknown): obj is NodeJS.ErrnoException {
  if (typeof obj !== "object" || obj === null) return false;
  const errorObj = obj as { code?: unknown; errno?: unknown; syscall?: unknown };
  return (
    "code" in errorObj &&
    typeof errorObj.code === "string" &&
    "errno" in errorObj &&
    (typeof errorObj.errno === "number" || typeof errorObj.errno === "string") &&
    "syscall" in errorObj &&
    typeof errorObj.syscall === "string"
  );
}

// Helper: read the generated diagram file and return its content
export async function readGeneratedDiagramFile(
  diagramPath: string
): Promise<string> {
  try {
    return await fs.promises.readFile(diagramPath, "utf8");
  } catch (err) {
    throw new Error(
      `Diagram file not found at ${diagramPath}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

// Helper: delete generated diagram if lifecycle setting requests it
export async function maybeDeleteGeneratedDiagram(
  diagramPath: string,
  lifecycle: string = "auto-delete"
): Promise<void> {
  if (lifecycle === "auto-delete") {
    try {
      await fs.promises.unlink(diagramPath);
    } catch (delErr: unknown) {
      // If file already missing, silently ignore
      if (isErrnoException(delErr) && delErr.code === "ENOENT") return;
      // Provide a helpful error message including the path so the UI can show context
      const message = delErr instanceof Error ? delErr.message : String(delErr);
      throw new Error(
        `Failed to delete generated diagram at ${diagramPath}: ${message}`
      );
    }
  }
}

/**
 * Invokes the appropriate Mix task to generate a diagram for the given resource file and diagram spec.
 * Returns a promise that resolves when the Mix task completes.
 */
export async function generateDiagramWithMix(
  resourceFilePath: string,
  diagramSpec: DiagramSpec,
  lifecycle: string = "auto-delete"
): Promise<string> {
  await runMixForDiagram(resourceFilePath, diagramSpec);

  const diagramPath = getGeneratedDiagramFilePath(
    resourceFilePath,
    diagramSpec
  );
  const content = await readGeneratedDiagramFile(diagramPath);

  // Respect lifecycle setting: delete generated file if configured
  await maybeDeleteGeneratedDiagram(diagramPath, lifecycle);

  return content;
}
