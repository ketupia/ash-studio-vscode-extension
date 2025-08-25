import * as vscode from "vscode";
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
import { Logger } from "../../utils/logger";

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
      const panel = getOrCreateAshStudioWebview(
        `AshStudio Diagram View`,
        "ashDiagramPreview"
      );

      // Set initial content (placeholder while generating)
      panel.webview.html = renderGeneratingDiagram(diagramFilePath);

      // Read lifecycle setting and run Mix, updating the webview with returned mermaid content
      const cfg = vscode.workspace.getConfiguration("ashStudio");
      const lifecycle = cfg.get<string>("diagramLifecycle", "auto-delete");

      generateDiagramWithMix(entry.target, entry.diagramSpec, lifecycle)
        .then((content: string) => {
          panel.webview.html = renderMermaidDiagram(content);
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
