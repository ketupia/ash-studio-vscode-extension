import * as vscode from "vscode";
import { ParsedDataProvider } from "../../parsedDataProvider";
import { ParsedChild, ParsedSection } from "../../types/parser";
import { Logger } from "../../utils/logger";
import { isElixirFile } from "../../utils/fileUtils";

/**
 * SidebarTreeProvider
 * ---------------
 * VS Code TreeDataProvider for the Ash Framework sidebar view.
 *
 * Responsibilities:
 * - Displays parsed Ash DSL sections and children for the active Elixir document.
 * - Listens for parse events from ParsedDataProvider and refreshes the sidebar UI.
 * - Handles recursive display of nested section children.
 * - Provides navigation commands to jump to section/detail locations in the source file.
 *
 * Architectural Notes:
 * - Depends on ParsedDataProvider for parsed data and cache management.
 * - Pure logic (parsing, models) is separated from VS Code integration.
 * - All references to 'Ash' prefix have been removed for clarity and consistency.
 * - SidebarItem class encapsulates both section and detail tree items, supporting recursive nesting.
 *
 * Usage:
 *   const provider = new SidebarTreeProvider(ParsedDataProvider.getInstance());
 *   vscode.window.registerTreeDataProvider('ashSidebar', provider);
 *
 * See CONTRIBUTING.md for commenting and architecture guidelines.
 */

// Configurable debounce delay for sidebar refresh (ms)
const SIDEBAR_DEBOUNCE_DELAY = 200;

export class SidebarTreeProvider
  implements vscode.TreeDataProvider<SidebarItem>
{
  constructor(private readonly parsedDataProvider: ParsedDataProvider) {
    // Debounced refresh for text document changes
    const debouncedRefresh = this.debounce(
      () => this.refresh(),
      SIDEBAR_DEBOUNCE_DELAY,
      "textDocumentChange"
    );
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument(event => {
        const activeEditor = vscode.window.activeTextEditor;
        if (
          activeEditor &&
          event.document === activeEditor.document &&
          isElixirFile(activeEditor.document)
        ) {
          debouncedRefresh();
        }
      })
    );
    // Refresh sidebar when active editor changes
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && isElixirFile(editor.document)) {
          this.refresh();
        }
      })
    );
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    SidebarItem | undefined | void
  > = new vscode.EventEmitter<SidebarItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SidebarItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private logger = Logger.getInstance();
  private _debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private _disposables: vscode.Disposable[] = [];

  private debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number,
    key: string = "default"
  ): T {
    return ((...args: Parameters<T>) => {
      const timer = this._debounceTimers.get(key);
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => fn(...args), delay);
      this._debounceTimers.set(key, newTimer);
    }) as T;
  }

  getTreeItem(element: SidebarItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SidebarItem): Promise<SidebarItem[]> {
    // Query parser for current active document
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      this.logger.debug(
        "SidebarTreeProvider",
        "No active editor, returning empty sidebar"
      );
      return [];
    }
    const filePath = activeEditor.document.uri.fsPath;

    // Get parse result for the active document
    const parseResult = this.parsedDataProvider.getParseResult(
      activeEditor.document
    );

    if (!element) {
      // Top-level: show main DSL sections
      return parseResult.sections.map(
        (section: ParsedSection) =>
          new SidebarItem(
            section.name, // Use section.name instead of section.section
            section.children && section.children.length > 0
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
            section.startingLocation.line, // Use startLine instead of line
            undefined,
            {
              command: "ash-studio.gotoFileLocation",
              title: "Go to Section",
              arguments: [
                filePath,
                { targetLine: section.startingLocation.line },
              ],
            },
            undefined,
            true // Mark as section
          )
      );
    } else if (element.isSection && element.sectionLine !== undefined) {
      // Level 1: Show details within a section
      const section = parseResult.sections.find(
        (s: ParsedSection) => s.startingLocation.line === element.sectionLine
      );
      if (!section || !section.children || section.children.length === 0)
        return [];

      return section.children.map((child: ParsedChild) =>
        this.createDetailTreeItem(child, filePath)
      );
    }

    return [];
  }

  /**
   * Helper method to create a tree item for a child, handling nested children recursively
   */
  private createDetailTreeItem(
    child: ParsedChild,
    filePath?: string
  ): SidebarItem {
    // Create a label that shows both keyword and name (if available)
    let label = child.keyword; // Default to just the keyword
    if (child.name && child.name !== child.keyword) {
      label = `${child.keyword} ${child.name}`; // Show both type and name
    }

    return new SidebarItem(
      label,
      vscode.TreeItemCollapsibleState.None,
      child.startingLocation.line,
      undefined, // Remove parent section display
      filePath
        ? {
            command: "ash-studio.gotoFileLocation",
            title: "Go to Detail",
            arguments: [filePath, { targetLine: child.startingLocation.line }],
          }
        : undefined,
      child, // Pass the detail for recursive nesting
      false // Not a section
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  dispose(): void {
    this._debounceTimers.forEach(timer => clearTimeout(timer));
    this._debounceTimers.clear();
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
}

class SidebarItem extends vscode.TreeItem {
  // Add a property to store the detail for recursive nesting
  public readonly detail?: ParsedChild;
  // Add a property to track if this is a section item
  public readonly isSection?: boolean;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly sectionLine?: number,
    public readonly parentSection?: string,
    public readonly command?: vscode.Command,
    detail?: ParsedChild,
    isSection: boolean = false
  ) {
    super(label, collapsibleState);
    if (parentSection) {
      this.description = parentSection;
    }
    this.detail = detail;
    this.isSection = isSection;
  }
}
