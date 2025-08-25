import * as vscode from "vscode";
import * as path from "path";
import {
  getOrCreateAshStudioWebview,
  renderGeneratingDiagram,
  renderMermaidDiagram,
} from "../ui/webview";
import {
  getGeneratedDiagramFilePath,
  generateDiagramWithMix,
} from "../../utils/diagramMixUtils";
import { DiagramCodeLensEntry } from "../../types/parser";

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

      // Verify local media assets exist before generation
      const mermaidUri = vscode.Uri.joinPath(
        context.extensionUri,
        "media",
        "mermaid.min.js"
      );
      const svgPanZoomUri = vscode.Uri.joinPath(
        context.extensionUri,
        "media",
        "svg-pan-zoom.min.js"
      );
      try {
        await vscode.workspace.fs.stat(mermaidUri);
        await vscode.workspace.fs.stat(svgPanZoomUri);
      } catch {
        const msg = `Ash Studio: required webview assets not found. Expected files in media/: mermaid.min.js and svg-pan-zoom.min.js. Please run \"npm run build\" to copy assets, or reinstall the extension.`;
        vscode.window.showErrorMessage(msg);
        panel.webview.html = `<html><body style="font-family: system-ui; color:#ddd; background:#1e1e1e; padding:16px;">
          <h2>Ash Studio — Missing Webview Assets</h2>
          <p>Required files were not found in the extension media folder:</p>
          <ul>
            <li>media/mermaid.min.js</li>
            <li>media/svg-pan-zoom.min.js</li>
          </ul>
          <p>Try:</p>
          <ol>
            <li>Run <code>npm run build</code> in the extension workspace.</li>
            <li>Reload VS Code.</li>
            <li>If the issue persists, reinstall the extension.</li>
          </ol>
        </body></html>`;
        return;
      }

      generateDiagramWithMix(entry.target, entry.diagramSpec, lifecycle)
        .then(async (content: string) => {
          const mermaidSrc = panel.webview.asWebviewUri(mermaidUri).toString();
          const svgPanZoomSrc = panel.webview
            .asWebviewUri(svgPanZoomUri)
            .toString();

          // Try to load template from extension's dist copy (fallback to inline renderer if anything fails)
          try {
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

            // Simple HTML-escape for mermaid content
            const escapeHtml = (s: string) =>
              String(s)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#39;");

            tpl = tpl.replace(/{{MERMAID_CODE}}/g, escapeHtml(content));
            tpl = tpl.replace(/{{MERMAID_SRC}}/g, mermaidSrc);
            tpl = tpl.replace(/{{SVGPANZOOM_SRC}}/g, svgPanZoomSrc);
            tpl = tpl.replace(/{{CSP_SOURCE}}/g, panel.webview.cspSource);

            panel.webview.html = tpl;
            return;
          } catch {
            // fallback to the existing renderer
            const html = renderMermaidDiagram(content, {
              mermaidSrc,
              svgPanZoomSrc,
              cspSource: panel.webview.cspSource,
            });
            panel.webview.html = html;
            return;
          }
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
