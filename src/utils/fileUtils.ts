import * as vscode from "vscode";

/**
 * Returns true if the given document is an Elixir source file (.ex or .exs) or has languageId 'elixir'.
 */
export function isElixirFile(document: vscode.TextDocument): boolean {
  return (
    document.languageId === "elixir" ||
    document.fileName.endsWith(".ex") ||
    document.fileName.endsWith(".exs")
  );
}
