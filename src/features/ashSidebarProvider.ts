import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { ParsedSection, ParsedDetail } from "../parsers/parser";
import { Logger } from "../utils/logger";

export class AshSidebarProvider
  implements vscode.TreeDataProvider<AshSidebarItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AshSidebarItem | undefined | void
  > = new vscode.EventEmitter<AshSidebarItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    AshSidebarItem | undefined | void
  > = this._onDidChangeTreeData.event;

  private logger = Logger.getInstance();

  constructor(private parserService: AshParserService) {
    this.logger.info("AshSidebarProvider", "Sidebar provider initialized");
  }

  getTreeItem(element: AshSidebarItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AshSidebarItem): Promise<AshSidebarItem[]> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this.logger.debug(
        "AshSidebarProvider",
        "No active editor, returning empty sidebar"
      );
      return [];
    }
    const document = editor.document;

    // Use the centralized parser service
    const parseResult = this.parserService.getParseResult(document);

    if (!parseResult.isAshFile) {
      return [];
    }

    if (!element) {
      // Top-level: show main DSL sections
      return parseResult.sections.map(
        section =>
          new AshSidebarItem(
            section.section, // Use section.section instead of section.name
            section.details && section.details.length > 0
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
            section.startLine, // Use startLine instead of line
            undefined,
            {
              command: "ash-studio.revealSectionOrSubBlock",
              title: "Go to Section",
              arguments: [section.startLine],
            }
          )
      );
    } else if (element.sectionLine !== undefined) {
      // Children: show section details within a section
      const section = parseResult.sections.find(
        s => s.startLine === element.sectionLine
      );
      if (!section || !section.details || section.details.length === 0)
        return [];

      return section.details.map(
        (detail: ParsedDetail) =>
          new AshSidebarItem(
            `${detail.name || detail.detail}`, // Use detail.name or fallback to detail.detail
            vscode.TreeItemCollapsibleState.None,
            detail.line,
            section.section, // Use section.section instead of section.name
            {
              command: "ash-studio.revealSectionOrSubBlock",
              title: "Go to Detail",
              arguments: [detail.line],
            }
          )
      );
    }

    return [];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export class AshSidebarItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly sectionLine?: number,
    public readonly parentSection?: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    if (sectionLine !== undefined) {
      this.command = {
        command: "ash-studio.revealSectionOrSubBlock",
        title: "Go to block",
        arguments: [sectionLine],
      };
    }
    if (parentSection) {
      this.description = parentSection;
    }
  }
}
