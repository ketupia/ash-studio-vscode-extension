/**
 * Describes the structure of a DSL block in Ash code.  This could be a section like "attributes do ... end",
 * or a detail like "attribute :name, :type".
 */
export interface DslBlock {
  /** Name of the block  (e.g., "attributes", "attribute", "calculate") */
  blockName: string;

  /** For 'named' patterns: regex to capture the name, omit if there isn't one */
  namePattern?: string;

  /** For 'group' patterns: child patterns to look for inside */
  children?: DslBlock[];
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
  /** Optional array of diagram specifications for this module */
  diagrams?: DiagramSpec[];
}

/**
 * Describes a diagram generation specification for Ash modules.
 */
export interface DiagramSpec {
  /** Human-friendly name for the diagram (e.g., "Policy Flowchart") */
  name: string;
  /** The keyword/section to match (e.g., "policies", "classes") */
  keyword: string;
  /** The Mix command to run (e.g., "ash.generate_policy_charts") */
  command: string;
  /** The expected diagram file naming pattern (e.g., ".*-policy-flowchart.(mmd|svg|png|pdf)") */
  filePattern: string;
  /** For commands that support a type option (e.g., "class", "entity") */
  type?: string;
}
