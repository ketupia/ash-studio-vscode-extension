import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
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
            section.name, // Just the section name (e.g., "attributes", "actions")
            section.children && section.children.length > 0
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
            section.line,
            undefined,
            {
              command: "ash-studio.revealSectionOrSubBlock",
              title: "Go to Section",
              arguments: [section.line],
            }
          )
      );
    } else if (element.sectionLine !== undefined) {
      // Children: show section details within a section
      const section = parseResult.sections.find(
        s => s.line === element.sectionLine
      );
      if (!section || !section.children || section.children.length === 0)
        return [];

      return section.children.map(
        detail =>
          new AshSidebarItem(
            `${detail.name}`, // Just the detail name (e.g., "email", "create")
            vscode.TreeItemCollapsibleState.None,
            detail.line,
            section.name,
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
