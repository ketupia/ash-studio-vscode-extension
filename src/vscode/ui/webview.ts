import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

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
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, char => {
    switch (char) {
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
        return char;
    }
  });
}

/**
 * Generate HTML content for the AshStudio webview based on the diagram file type.
 * @param diagramFilePath Absolute path to the diagram file.
 * @param webview The webview instance (for resource URIs).
 * @returns HTML string for the webview.
 */
export function generateDiagramWebviewContent(
  diagramFilePath: string,
  webview: vscode.Webview
): string {
  const ext = path.extname(diagramFilePath).toLowerCase();
  if (!fs.existsSync(diagramFilePath)) {
    return `<html><body><h2>Generating diagram...</h2><p style='color:#888;font-size:0.9em;'>${escapeHtml(
      diagramFilePath
    )}</p></body></html>`;
  }

  if ([".svg", ".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
    const imgSrc = webview.asWebviewUri(vscode.Uri.file(diagramFilePath));
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#222;">
      <img src="${imgSrc}" style="max-width:100%;max-height:100vh;box-shadow:0 0 16px #000;" />
    </body></html>`;
  }

  if (ext === ".pdf") {
    const pdfSrc = webview.asWebviewUri(vscode.Uri.file(diagramFilePath));
    return `<!DOCTYPE html><html><body style="background:#222;color:#fff;text-align:center;padding:2em;">
      <h2>PDF Diagram</h2>
      <p>PDF preview is not supported in the webview. <a href="${pdfSrc}" download style="color:#4af;">Download PDF</a></p>
    </body></html>`;
  }

  // Mermaid or markdown
  if (ext === ".mmd" || ext === ".md") {
    const mermaidCode = fs.readFileSync(diagramFilePath, "utf8");
    return `<!DOCTYPE html><html><head>
      <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
      </script>
      <style>body{background:#222;color:#fff;} .mermaid{background:#fff;color:#222;padding:1em;border-radius:8px;}</style>
    </head><body>
      <div class="mermaid">
        ${mermaidCode}
      </div>
    </body></html>`;
  }

  // Fallback: show as plain text
  const fileContent = fs.readFileSync(diagramFilePath, "utf8");
  return `<!DOCTYPE html><html><body style="background:#222;color:#fff;"><pre>${fileContent}</pre></body></html>`;
}
