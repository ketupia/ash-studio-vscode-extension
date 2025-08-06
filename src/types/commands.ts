/**
 * Argument for the ash-studio.gotoFileLocation command.
 * Use this interface for all navigation features (sidebar, QuickPick, code lens, etc.).
 */
export interface GotoFileLocationEntry {
  /** 1-based line number to navigate to (preferred) */
  targetLine?: number;
  /** 1-based line number (for legacy/fallback support; prefer startLine/endLine in new code) */
  line?: number;
}
