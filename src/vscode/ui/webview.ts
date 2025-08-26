import * as vscode from "vscode";
import { escapeHtml } from "../../utils/htmlUtils";

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
    // Update title in case caller provided a new title for the existing panel
    try {
      ashStudioPanel.title = title;
    } catch (err) {
      // Setting title should normally succeed; swallow any errors to avoid breaking callers
      console.debug("[AshStudio] Failed to set panel title:", err);
    }
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
export function renderGeneratingDiagram(diagramPath: string): string {
  const escaped = escapeHtml(String(diagramPath));

  return `<html><body><h2>Generating diagram...</h2><p style='color:#888;font-size:0.9em;'>${escaped}</p></body></html>`;
}