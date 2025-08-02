/**
 * Describes the structure of a DSL block in Ash code.
 *
 * SIMPLIFIED DSL PROCESSING:
 * - ROOT LEVEL: Always follows the pattern `<name> do ... end` (e.g., "attributes do ... end")
 * - CHILD PATTERNS: Simple keyword/name pattern searches within root block content
 *
 * ROOT DSL BLOCKS:
 * These are the top-level sections in Ash modules, always with do...end structure:
 * ```elixir
 * attributes do
 *   attribute :name, :string
 *   attribute :age, :integer
 * end
 *
 * actions do
 *   create :user
 *   read :list_users
 * end
 * ```
 *
 * CHILD PATTERN MATCHING:
 * Instead of complex hierarchical parsing, we search for simple patterns within
 * root block content:
 * ```elixir
 * # In attributes block, search for:
 * attribute :name, :string    # pattern: "attribute" + namePattern: "(:\w+)"
 * uuid_primary_key(:id)       # pattern: "uuid_primary_key"
 *
 * # In actions block, search for:
 * create :user               # pattern: "create" + namePattern: "(:\w+)"
 * read :list_users           # pattern: "read" + namePattern: "(:\w+)"
 * ```
 *
 * This approach handles all syntactic forms (do...end, do:, comma-separated, single-line)
 * without requiring complex nested parsing logic.
 */
export interface DslBlock {
  /**
   * Name of the root DSL block (e.g., "attributes", "actions", "policies")
   *
   * ROOT BLOCKS: Always section names that appear as `<blockName> do ... end`
   */
  blockName: string;

  /**
   * Array of child patterns to search for within this root block's content
   *
   * PATTERN MATCHING:
   * - Each child pattern represents a keyword to find (like "attribute", "create")
   * - Patterns are searched as simple text matches within the root block
   * - No complex nesting - just keyword + optional name extraction
   *
   * EXAMPLE:
   * ```typescript
   * {
   *   blockName: "attributes",
   *   childPatterns: [
   *     { keyword: "attribute", namePattern: "(:\w+)" },
   *     { keyword: "uuid_primary_key" },
   *     { keyword: "create_timestamp" }
   *   ]
   * }
   * ```
   */
  childPatterns?: ChildPattern[];
}

/**
 * Describes a simple pattern to search for within a root DSL block
 */
export interface ChildPattern {
  /**
   * The keyword to search for (e.g., "attribute", "create", "allow")
   */
  keyword: string;

  /**
   * Optional regex pattern to capture the name/identifier from the match
   *
   * EXAMPLES:
   * - For "attribute :name, :string" → pattern "(:\w+)" captures ":name"
   * - For "create :user do" → pattern "(:\w+)" captures ":user"
   * - For functions without names, omit this property
   */
  namePattern?: string;
}

/**
 * Describes the interface for an Ash module or library configuration.
 *
 * MODULE CONFIGURATION PURPOSE:
 * Each Ash module (like Ash.Resource, Ash.Domain) or library (like AshPostgres, AshAuthentication)
 * defines its own set of DSL blocks that can appear in Elixir files using that module.
 *
 * CONFIGURATION STRUCTURE:
 * ```elixir
 * defmodule MyApp.User do
 *   use Ash.Resource  # ← declarationPattern matches this
 *
 *   # Root DSL blocks defined in dslBlocks:
 *   attributes do     # ← Root block: always do...end
 *     # child blocks here
 *   end
 *
 *   actions do        # ← Another root block
 *     # child blocks here
 *   end
 * end
 * ```
 *
 * The parser uses this configuration to:
 * 1. Match files that use this module (via declarationPattern)
 * 2. Find root-level DSL blocks (via dslBlocks array)
 * 3. Parse nested content within each block (via children definitions)
 * 4. Generate documentation links and diagrams (via lens configurations)
 */
export interface ModuleInterface {
  /**
   * Human-friendly name for the module (e.g., "Ash Resource", "Ash Domain", "AshPostgres Repo")
   * Used in UI displays, error messages, and documentation.
   */
  displayName: string;

  /**
   * Pattern to match in the `use` statement that activates this module's DSL
   *
   * EXAMPLES:
   * - "Ash.Resource" matches `use Ash.Resource`
   * - "Ash.Domain" matches `use Ash.Domain`
   * - "AshPostgres.Repo" matches `use AshPostgres.Repo`
   *
   * When this pattern is found in a file's use declarations, the file becomes
   * eligible for parsing with this module's DSL block definitions.
   */
  declarationPattern: string;

  /**
   * Array of root-level DSL sections available in this module
   *
   * ROOT BLOCK CHARACTERISTICS:
   * - Always follow `<blockName> do ... end` structure
   * - Can contain nested child blocks with various syntactic forms
   * - Appear at the module level (not nested within other blocks)
   * - Each represents a major functional area (attributes, actions, policies, etc.)
   *
   * EXAMPLE FOR ASH.RESOURCE:
   * - attributes (for defining resource fields)
   * - actions (for CRUD and custom operations)
   * - policies (for authorization rules)
   * - relationships (for associations)
   * - etc.
   */
  dslBlocks: DslBlock[];

  /**
   * Array of diagram generation specifications for this module
   * Enables automatic diagram generation from DSL content (flowcharts, ERDs, etc.)
   */
  diagramLenses?: DiagramSpec[];
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
  mixCommand: string;
  /** The expected diagram file naming pattern (e.g., ".*-policy-flowchart.(mmd|svg|png|pdf)") */
  filePattern: string;
  /** For commands that support a type option (e.g., "class", "entity") */
  type?: string;
}

/**
 * Interface for the configuration registry class.
 * Allows for easier mocking and future extensibility.
 */
export interface ConfigurationRegistryInterface {
  getAll(): ModuleInterface[];
}
