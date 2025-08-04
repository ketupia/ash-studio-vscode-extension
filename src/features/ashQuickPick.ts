import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { ParsedSection } from "../types/parser";

interface SectionQuickPickItem extends vscode.QuickPickItem {
  section: ParsedSection;
}

export function registerAshQuickPick(
  context: vscode.ExtensionContext,
  parserService?: AshParserService
) {
  const parser = parserService || AshParserService.getInstance();

  const quickPickCommand = vscode.commands.registerCommand(
    "ash-studio.gotoSection",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || activeEditor.document.languageId !== "elixir") {
        vscode.window.showInformationMessage("No active Elixir file");
        return;
      }

      // Query parser for current document
      let parseResult = parser.getCachedResult(activeEditor.document);
      if (!parseResult) {
        parseResult = parser.parseElixirDocument(activeEditor.document);
      }

      if (!parseResult || parseResult.sections.length === 0) {
        vscode.window.showInformationMessage("No Ash sections found");
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
