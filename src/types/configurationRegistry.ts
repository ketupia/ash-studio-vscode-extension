export const namePatterns = {
  // Pattern for boolean names (e.g., attribute :someCondition?)
  // This captures atoms and with optional leading colon. Must end in a question mark
  boolean_name: "(:\\w+\\?|\\w+\\?)", // All forms must end with ?

  // Pattern for primitive names (e.g., attribute :name, :name?, name?)
  // This captures atoms and with optional leading colon and with optional question mark
  primitive_name: "(:\\w+\\?|:\\w+|\\w+\\?)",

  // Pattern for names that can't be booleans (e.g., has_many :relationship)
  // This captures atoms and with optional leading colon
  not_boolean_name: "(:\\w+|\\w+)",

  // Pattern for everything between keyword and 'do' (for policies, bypass, etc)
  everything_up_to_do: "([^\\s].*?)\\s+do",
};

/**
 * Describes the structure of a DSL section in Ash code.
 *
 * SIMPLIFIED DSL PROCESSING:
 * - ROOT LEVEL: Always follows the pattern `<name> do ... end` (e.g., "attributes do ... end")
 * - CHILD PATTERNS: Simple keyword/name pattern searches within root section content
 *
 * ROOT DSL SECTIONS:
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
 * root section content:
 * ```elixir
 * # In attributes section, search for:
 * attribute :name, :string    # pattern: "attribute" + namePattern: "(:\w+)"
 * uuid_primary_key(:id)       # pattern: "uuid_primary_key"
 *
 * # In actions section, search for:
 * create :user               # pattern: "create" + namePattern: "(:\w+)"
 * read :list_users           # pattern: "read" + namePattern: "(:\w+)"
 * ```
 *
 * This approach handles all syntactic forms (do...end, do:, comma-separated, single-line)
 * without requiring complex nested parsing logic.
 */
export interface DslSection {
  /**
   * Name of the root DSL section (e.g., "attributes", "actions", "policies")
   *
   * ROOT SECTIONS: Always section names that appear as `<sectionName> do ... end`
   */
  name: string;

  /**
   * Array of child patterns to search for within this root section's content
   *
   * PATTERN MATCHING:
   * - Each child pattern represents a keyword to find (like "attribute", "create")
   * - Patterns are searched as simple text matches within the root section
   * - No complex nesting - just keyword + optional name extraction
   *
   * EXAMPLE:
   * ```typescript
   * {
   *   name: "attributes",
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
 * Describes a simple pattern to search for within a root DSL section
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

  /**
   * Indicates if this child pattern represents a definition (not just a reference).
   * If true, matches will be collected as definitions for navigation.
   */
  isDefinition?: boolean;
}

/**
 * Describes the interface for an Ash module or library configuration.
 *
 * MODULE CONFIGURATION PURPOSE:
 * Each Ash module (like Ash.Resource, Ash.Domain) or library (like AshPostgres, AshAuthentication)
 * defines its own set of DSL sections that can appear in Elixir files using that module.
 *
 * CONFIGURATION STRUCTURE:
 * ```elixir
 * defmodule MyApp.User do
 *   use Ash.Resource  # ← declarationPattern matches this
 *
 *   # Root DSL sections defined in dslSections:
 *   attributes do     # ← Root section: always do...end
 *     # child sections here
 *   end
 *
 *   actions do        # ← Another root section
 *     # child sections here
 *   end
 * end
 * ```
 *
 * The parser uses this configuration to:
 * 1. Match files that use this module (via declarationPattern)
 * 2. Find root-level DSL sections (via dslSections array)
 * 3. Parse nested content within each section (via children definitions)
 * 4. Generate  diagrams (via lens configurations)
 */
export interface ModuleConfiguration {
  /**
   * Human-friendly name for the module (e.g., "Ash Resource", "Ash Domain", "AshPostgres Repo")
   * Used in UI displays, error messages, and diagrams.
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
   * eligible for parsing with this module's DSL section definitions.
   */
  declarationPattern: string;

  /**
   * Array of root-level DSL sections available in this module
   *
   * ROOT SECTION CHARACTERISTICS:
   * - Always follow `<sectionName> do ... end` structure
   * - Can contain nested child sections with various syntactic forms
   * - Appear at the module level (not nested within other sections)
   * - Each represents a major functional area (attributes, actions, policies, etc.)
   *
   * EXAMPLE FOR ASH.RESOURCE:
   * - attributes (for defining resource fields)
   * - actions (for CRUD and custom operations)
   * - policies (for authorization rules)
   * - relationships (for associations)
   * - etc.
   */
  dslSections: DslSection[];

  /**
   * Array of diagram generation specifications for this module
   * Enables automatic diagram generation from DSL content (flowcharts, ERDs, etc.)
   */
  diagramSpecs?: DiagramSpec[];
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
  /** The expected diagram file pattern (e.g., ".*-policy-flowchart.(mmd|svg|png|pdf)") */
  filePattern: string;
  /** For commands that support a type option (e.g., "class", "entity") */
  type?: string;
}

/**
 * Interface for the configuration registry class.
 * Allows for easier mocking and future extensibility.
 */
export interface ConfigurationRegistry {
  getAll(): ModuleConfiguration[];
}
