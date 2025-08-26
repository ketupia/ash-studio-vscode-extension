import * as vscode from "vscode";
import * as path from "path";
import {
  getOrCreateAshStudioWebview,
  renderGeneratingDiagram,
} from "../ui/webview";
import {
  getGeneratedDiagramFilePath,
  generateDiagramWithMix,
} from "../../utils/diagramMixUtils";
import { DiagramCodeLensEntry } from "../../types/parser";
import { escapeHtml } from "../../utils/htmlUtils";

// Compute a friendly, concise title for the webview using the diagram spec name and the target
function computeWebviewTitle(entry: DiagramCodeLensEntry): string {
  const specName = entry.diagramSpec?.name ?? "Diagram";
  let targetLabel = String(entry.target ?? "");
  targetLabel = path.basename(targetLabel);
  return `${specName} — ${targetLabel}`;
}

/**
 * Register the command that shows a generated diagram in a webview.
 * Extracted from extension.ts to keep activation smaller and easier to test.
 */
export function registerShowDiagram(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "ash-studio.showDiagram",
    async (entry: DiagramCodeLensEntry) => {
      const diagramFilePath = getGeneratedDiagramFilePath(
        entry.target,
        entry.diagramSpec
      );

      const computedTitle = computeWebviewTitle(entry);
      const panel = getOrCreateAshStudioWebview(
        computedTitle,
        "ashDiagramPreview"
      );

      // Set initial content (placeholder while generating)
      panel.webview.html = renderGeneratingDiagram(diagramFilePath);

      // Read lifecycle setting and run Mix, updating the webview with returned mermaid content
      const cfg = vscode.workspace.getConfiguration("ashStudio");
      const lifecycle = cfg.get<string>("diagramLifecycle", "auto-delete");

      generateDiagramWithMix(entry.target, entry.diagramSpec, lifecycle)
        .then(async (content: string) => {
          const templateUri = vscode.Uri.joinPath(
            context.extensionUri,
            "dist",
            "src",
            "vscode",
            "ui",
            "templates",
            "mermaidWebview.html"
          );
          const bytes = await vscode.workspace.fs.readFile(templateUri);
          let tpl = Buffer.from(bytes).toString("utf8");

          tpl = tpl.replace(/{{MERMAID_CODE}}/g, escapeHtml(content));
          // Include CDN host in CSP so templates that reference CDN scripts can load them
          const cspWithCdn = `${panel.webview.cspSource} https://cdn.jsdelivr.net`;
          tpl = tpl.replace(/{{CSP_SOURCE}}/g, cspWithCdn);

          panel.webview.html = tpl;
          return;
        })
        .catch(err => {
          vscode.window.showErrorMessage(
            `Failed to generate diagram: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        });
    }
  );

  context.subscriptions.push(disposable);
  return disposable;
}
