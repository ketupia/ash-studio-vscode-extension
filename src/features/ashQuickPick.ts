import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";

export function registerAshQuickPick(
  context: vscode.ExtensionContext,
  parserService?: AshParserService
) {
  const parser = parserService || AshParserService.getInstance();

  // Cache the latest parse result
  let latestParseResult: ReturnType<typeof parser.documentActivated> | null =
    null;

  // Listen for parse events to update the cache
  parser.onDidParse(result => {
    latestParseResult = result;
  });

  const quickPickCommand = vscode.commands.registerCommand(
    "ash-studio.gotoSection",
    async () => {
      if (!latestParseResult) {
        vscode.window.showInformationMessage("No parse result available");
        return;
      }
      // Create QuickPick items from parsed sections
      const items = latestParseResult.sections.map(section => ({
        label: section.section,
        description: `Line ${section.startLine}`,
        section: section,
      }));
      if (items.length === 0) {
        vscode.window.showInformationMessage("No Ash sections found");
        return;
      }
      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: "Go to Ash section...",
      });
      if (pick && pick.section) {
        const position = new vscode.Position(pick.section.startLine - 1, 0);
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

  // Track the current quick pick command registration
  let quickPickDisposable: vscode.Disposable | undefined = quickPickCommand;

  // Listen for parse events to re-register the command (ensures latest parse result)
  parser.onDidParse(() => {
    if (quickPickDisposable) {
      quickPickDisposable.dispose();
    }
    quickPickDisposable = vscode.commands.registerCommand(
      "ash-studio.gotoSection",
      async () => {
        if (!latestParseResult) {
          vscode.window.showInformationMessage("No parse result available");
          return;
        }
        const items = latestParseResult.sections.map(section => ({
          label: section.section,
          description: `Line ${section.startLine}`,
          section: section,
        }));
        if (items.length === 0) {
          vscode.window.showInformationMessage("No Ash sections found");
          return;
        }
        const pick = await vscode.window.showQuickPick(items, {
          placeHolder: "Go to Ash section...",
        });
        if (pick && pick.section) {
          const position = new vscode.Position(pick.section.startLine - 1, 0);
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
    context.subscriptions.push(quickPickDisposable);
  });
}
