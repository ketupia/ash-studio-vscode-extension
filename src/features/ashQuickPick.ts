import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";

export function registerAshQuickPick(
  context: vscode.ExtensionContext,
  parserService?: AshParserService
) {
  const parser = parserService || AshParserService.getInstance();

  const quickPickCommand = vscode.commands.registerCommand(
    "ash-studio.gotoSection",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor");
        return;
      }

      const document = editor.document;

      // Use the centralized parser service
      const parseResult = parser.getParseResult(document);

      if (!parseResult.isAshFile) {
        vscode.window.showInformationMessage(
          "Not an Ash file (Resource, Domain, or Type)"
        );
        return;
      }

      // Create QuickPick items from parsed sections
      const items = parseResult.sections.map(section => ({
        label: section.section,
        description: `Line ${section.startLine}`, // Use 1-based line number directly
        section: section, // Keep reference to full section data
      }));

      if (items.length === 0) {
        vscode.window.showInformationMessage("No Ash sections found");
        return;
      }

      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: "Go to Ash section...",
      });

      if (pick && pick.section) {
        const position = new vscode.Position(
          pick.section.startLine - 1, // Convert to 0-based for VS Code
          0 // Start at beginning of line
        );
        vscode.window.activeTextEditor!.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
        vscode.window.activeTextEditor!.selection = new vscode.Selection(
          position,
          position
        );
      }
    }
  );
  context.subscriptions.push(quickPickCommand);
}
