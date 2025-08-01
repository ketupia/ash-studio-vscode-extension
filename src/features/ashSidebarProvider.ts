import * as vscode from "vscode";
import { AshParserService } from "../ashParserService";
import { ParsedDetail } from "../parsers/parser";
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

  // Cache the latest parse result
  private latestParseResult: ReturnType<
    AshParserService["documentActivated"]
  > | null = null;

  constructor(private parserService: AshParserService) {
    this.logger.info("AshSidebarProvider", "Sidebar provider initialized");
    // Listen for parse events to refresh the sidebar and update cache
    this.parserService.onDidParse(result => {
      this.latestParseResult = result;
      this.refresh();
    });
  }

  getTreeItem(element: AshSidebarItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AshSidebarItem): Promise<AshSidebarItem[]> {
    if (!this.latestParseResult) {
      this.logger.debug(
        "AshSidebarProvider",
        "No parse result available, returning empty sidebar"
      );
      return [];
    }
    const parseResult = this.latestParseResult;

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
            },
            undefined,
            true // Mark as section
          )
      );
    } else if (element.isSection && element.sectionLine !== undefined) {
      // Level 1: Show details within a section
      const section = parseResult.sections.find(
        s => s.startLine === element.sectionLine
      );
      if (!section || !section.details || section.details.length === 0)
        return [];

      return section.details.map((detail: ParsedDetail) =>
        this.createDetailTreeItem(detail)
      );
    } else if (
      element.detail &&
      element.detail.childDetails &&
      element.detail.childDetails.length > 0
    ) {
      // Level 2+: Show nested details (recursive handling)
      return element.detail.childDetails.map((childDetail: ParsedDetail) =>
        this.createDetailTreeItem(childDetail)
      );
    }

    return [];
  }

  /**
   * Helper method to create a tree item for a detail, handling nested details recursively
   */
  private createDetailTreeItem(detail: ParsedDetail): AshSidebarItem {
    const hasChildren = detail.childDetails && detail.childDetails.length > 0;

    // Create a label that shows both block type and name (if available)
    let label = detail.detail; // Default to just the block type
    if (detail.name && detail.name !== detail.detail) {
      label = `${detail.detail} ${detail.name}`; // Show both type and name
    }

    return new AshSidebarItem(
      label,
      hasChildren
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      detail.line,
      undefined, // Remove parent section display
      {
        command: "ash-studio.revealSectionOrSubBlock",
        title: "Go to Detail",
        arguments: [detail.line],
      },
      detail, // Pass the detail for recursive nesting
      false // Not a section
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export class AshSidebarItem extends vscode.TreeItem {
  // Add a property to store the detail for recursive nesting
  public readonly detail?: ParsedDetail;
  // Add a property to track if this is a section item
  public readonly isSection?: boolean;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly sectionLine?: number,
    public readonly parentSection?: string,
    public readonly command?: vscode.Command,
    detail?: ParsedDetail,
    isSection: boolean = false
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
    this.detail = detail;
    this.isSection = isSection;
  }
}
