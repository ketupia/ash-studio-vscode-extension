/**
 * Module Configuration System: Big Picture
 *
 * These types power the module configuration system for the Ash Studio VS Code Extension.
 *
 * Each Ash module or library (e.g., Ash.Resource, Ash.Domain, AshPostgres) defines its own configuration
 * describing how its DSL sections and keywords should be parsed, displayed, and visualized in VS Code.
 */

import { SymbolKind } from "vscode";

/**
 * Interface for the configuration registry class.
 */
export interface ConfigurationRegistry {
  getAll(): ModuleConfiguration[];
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
 *   attributes do     # ← Root section named attributes
 *     # children here
 *   end
 *
 *   actions do        # ← Another root section
 *     # children here
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
   * - Always follow `<name> do ... end` structure
   * - Can contain nested child sections with various syntactic forms
   * - Appear at the module level (not nested within other sections)
   * - Each represents a major functional area (attributes, actions, policies, etc.)
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
  /** The expected diagram file pattern (e.g., ".-policy-flowchart.mmd") */
  filePattern: string;
  /** For commands that support a type option (e.g., "class", "entity") */
  type?: string;
}

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
 */
export interface DslSection {
  /**
   * Name of the root DSL section (e.g., "attributes", "actions", "policies")
   *
   * ROOT SECTIONS: Always section names that appear as `<sectionName> do ... end`
   */
  name: string;

  /**
   * Array of child patterns to search for within this root section's content.
   */
  childPatterns?: ChildPattern[];

  symbol?: SymbolKind;
}

/**
 * Describes a pattern to search for within a root DSL section
 *
 * PATTERN MATCHING:
 * - Each child pattern represents a keyword to find (like "attribute", "create")
 *
 * EXAMPLE:
 * ```typescript
 * {
 *   name: "attributes",
 *   childPatterns: [
 *     { keyword: "attribute", namePattern: namePatterns.primitive_name },
 *     { keyword: "uuid_primary_key" },
 *   ]
 * }
 * ```
 */
export interface ChildPattern {
  /**
   * The keyword to search for (e.g., "attribute", "create", "allow")
   * This is an exact match.
   */
  keyword: string;

  /**
   * Optional regex pattern to capture the name/identifier from the match
   * Use defined namePatterns when possible.
   */
  namePattern?: string;

  /**
   * If true, matches will be used as definitions for navigation.
   */
  isDefinition?: boolean;
}

const optionalOpeningParen = "\\(?";
const optionalClosingParen = "\\)?";
const atom = ":\\w+";
const atomWithQ = ":\\w+\\?";
const bare = "\\w+";
const bareWithQ = "\\w+\\?";
const captureStart = "(";
const captureEnd = ")";

export const namePatterns = {
  // Pattern for boolean names (e.g., attribute :someCondition?)
  // This captures atoms and with optional leading colon. Must end in a question mark
  boolean_name: `${optionalOpeningParen}${captureStart}${atomWithQ}|${bareWithQ}${captureEnd}${optionalClosingParen}`,

  // Pattern for primitive names (e.g., attribute :name, :name?, name?)
  // This captures atoms and with optional leading colon and with optional question mark
  primitive_name: `${optionalOpeningParen}${captureStart}${atomWithQ}|${atom}|${bareWithQ}|${bare}${captureEnd}${optionalClosingParen}`,

  // Pattern for names that can't be booleans (e.g., has_many :relationship)
  // This captures atoms and with optional leading colon
  not_boolean_name: `${optionalOpeningParen}${captureStart}${atom}|${bare}${captureEnd}${optionalClosingParen}`,

  // Pattern for everything between keyword and 'do' (for policies, bypass, etc)
  everything_up_to_do: "(.*?)(?=\\sdo$|,$|$)",
};
