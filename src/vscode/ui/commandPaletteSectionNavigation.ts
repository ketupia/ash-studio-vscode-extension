import * as vscode from "vscode";
import { ParsedDataProvider } from "../../parsedDataProvider";
import { ParsedSection } from "../../types/parser";

/**
 * Registers the QuickPick command for fast Ash section navigation in Elixir files.
 * This feature adds the "Go to Ash section..." command to the command palette (Cmd+Shift+P),
 * allowing users to quickly jump to Ash DSL sections in the current document.
 *
 * Usage:
 *   registerCommandPaletteSectionNavigation(context, ParsedDataProvider.getInstance());
 *   // Command: ash-studio.gotoSection
 */

interface SectionQuickPickItem extends vscode.QuickPickItem {
  section: ParsedSection;
}

export function registerCommandPaletteSectionNavigation(
  context: vscode.ExtensionContext,
  parsedDataProvider: ParsedDataProvider
) {
  const quickPickCommand = vscode.commands.registerCommand(
    "ash-studio.gotoSection",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || activeEditor.document.languageId !== "elixir") {
        vscode.window.showInformationMessage("No active Elixir file");
        return;
      }

      // Query parser for current document
      const parseResult = parsedDataProvider.getParseResult(
        activeEditor.document
      );

      if (!parseResult || parseResult.sections.length === 0) {
        vscode.window.showInformationMessage(
          "No Ash sections found in this file."
        );
        return;
      }

      // Create QuickPick items from parsed sections
      const items: SectionQuickPickItem[] = parseResult.sections.map(
        (section: ParsedSection) => ({
          label: section.section,
          description: `Lines ${section.startLine}-${section.endLine}`,
          section: section,
        })
      );

      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: "Go to Ash section...",
      });

      if (pick && pick.section) {
        await vscode.commands.executeCommand(
          "ash-studio.gotoFileLocation",
          activeEditor.document.uri.fsPath,
          { line: pick.section.startLine }
        );
      }
    }
  );

  context.subscriptions.push(quickPickCommand);
}
