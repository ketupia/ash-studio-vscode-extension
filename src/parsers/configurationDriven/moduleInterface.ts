/**.
 * Describes the structure of a DSL block in Ash code.  This could be a section like "attributes do ... end",
 * or a detail like "attribute :name, :type".
 */
export interface DslBlock {
  /** Name of the block  (e.g., "attributes", "attribute", "calculate") */
  blockName: string;

  /** Whether this section requires a 'do' block: "required", "prohibited", or "optional" */
  doBlock: "required" | "prohibited" | "optional";

  /** For 'named' patterns: regex to capture the name, omit if there isn't one */
  namePattern?: string;

  /** For 'group' patterns: child patterns to look for inside */
  children?: DslBlock[];

  /**
   * Whether child items should be grouped by their block name.
   * If true, children will be grouped by their blockName.
   * For example, if you have multiple "action" blocks, they will be grouped under
   * actions > create > action_name_1, action_name_2
   * actions > update > action_name_3, action_name_4
   */
  groupChildren?: boolean;
}

/**
 * Describes the interface for an Ash code like Ash.Resource or a library like Ash.Postgres.
 */
export interface ModuleInterface {
  /** Human-friendly name for the module (e.g., "Ash Resource") */
  displayName: string;
  /** The declaration pattern to match in the use statement (e.g., "Ash.Resource") */
  declarationPattern: string;
  /** Map of keywords to documentation URLs for CodeLens features */
  codeLenses?: Record<string, string>;
  /** Array of DSL sections for this module */
  dslBlocks: DslBlock[];
  // Add more fields as needed for patterns, sidebar, diagnostics, etc.
}
