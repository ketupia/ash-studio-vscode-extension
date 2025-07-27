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

      if (parseResult.errors.length > 0) {
        // Show parse errors but still try to show any sections we found
        const errorMsg = parseResult.errors[0].message;
        vscode.window.showWarningMessage(`Parse error: ${errorMsg}`);
      }

      // Create QuickPick items from parsed sections
      const items = parseResult.sections.map(section => ({
        label: section.name,
        description: `Line ${section.line + 1}`, // Convert to 1-based for display
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
          pick.section.line,
          pick.section.column
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
