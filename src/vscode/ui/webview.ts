import * as vscode from "vscode";
import { Logger } from "../../utils/logger";
// ...existing code...

let ashStudioPanel: vscode.WebviewPanel | undefined;

/**
 * Get or create the singleton AshStudio webview panel.
 * If already open, reveals and returns it. Otherwise, creates a new one.
 * @param {string} title - The title for the webview panel.
 * @param {string} viewType - The viewType for the panel (default: 'ashStudio').
 * @returns {vscode.WebviewPanel}
 */
export function getOrCreateAshStudioWebview(
  title: string = "AshStudio Diagram",
  viewType: string = "ashStudio"
): vscode.WebviewPanel {
  if (ashStudioPanel) {
    ashStudioPanel.reveal(vscode.ViewColumn.Active);
    return ashStudioPanel;
  }

  ashStudioPanel = vscode.window.createWebviewPanel(
    viewType,
    title,
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  ashStudioPanel.onDidDispose(() => {
    ashStudioPanel = undefined;
  });

  return ashStudioPanel;
}

/**
 * Escape HTML special characters in a string to prevent XSS.
 * @param str The string to escape.
 * @returns The escaped string.
 */
// escapeHtml removed; escaping is inlined where needed
export function renderGeneratingDiagram(diagramPath: string): string {
  const escaped = String(diagramPath).replace(/[&<>"']/g, ch => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });

  return `<html><body><h2>Generating diagram...</h2><p style='color:#888;font-size:0.9em;'>${escaped}</p></body></html>`;
}

export function renderMermaidDiagram(mermaidCode: string): string {
  // const content = `<!DOCTYPE html><html><head>
  //     <script type="module">
  //       import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  //       mermaid.initialize({ startOnLoad: true });
  //     </script>
  //     <style>body{background:#222;color:#fff;} .mermaid{background:#fff;color:#222;padding:1em;border-radius:8px;}</style>
  //   </head><body>
  //     <div id="mermaidSvgDiv" class="mermaid">
  //       ${mermaidCode}
  //     </div>
  //   </body></html>`;

  const content = `<!DOCTYPE html><html><head>
      <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
      </script>
      <style>body{background:#222;color:#fff;} .mermaid{background:#fff;color:#222;padding:1em;border-radius:8px;}</style>
    </head><body>
      <div id="mermaidDiv" class="mermaid">
        ${mermaidCode}
      </div>
    </body></html>`;

  return content;
}
