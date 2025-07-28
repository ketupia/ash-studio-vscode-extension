# Ash DSL Configuration: ModuleInterface Pattern

## Overview

This VS Code extension enhances the developer experience when writing Ash Framework code by
providing intelligent navigation, sidebar organization, and (planned) advanced IDE features like
CodeLens, hover documentation, and diagnostics.

The extension uses a configuration-driven approach to parse, navigate, and display Ash Framework DSL
modules in Elixir projects. The core concept is the `ModuleInterface` object, which describes how
each Ash module (such as `Ash.Resource`) is structured and how its DSL blocks should be recognized
and processed for optimal developer tooling.

## Why This Pattern?

- **Enhanced Developer Experience:** Provides structured navigation, intelligent sidebar
  organization, and contextual information about Ash DSL blocks to make writing resources faster and
  less error-prone.
- **Extensibility:** New Ash modules or DSL features can be supported by adding or updating
  configuration objects, without changing core parsing logic.
- **Separation of Concerns:** Parsing rules, navigation, and sidebar display are all driven by
  config, making the codebase easier to maintain and extend.
- **Declarative Parsing:** Instead of hardcoding regexes and logic for each DSL block, the config
  describes what to look for and how to interpret it.
- **Future-Ready:** The configuration approach sets up the foundation for advanced IDE features like
  autocomplete, diagnostics, and refactoring tools.

## Key Concepts

### ModuleInterface

A `ModuleInterface` object defines:

- `displayName`: Human-friendly name for the module (e.g., "Ash Resource").
- `declarationPattern`: The string to match in Elixir `use` statements (e.g., `Ash.Resource`).
- `codeLenses`: (Optional) Map of keywords to documentation URLs for CodeLens features.
- `dslBlocks`: Array of `DslBlock` objects, each representing a top-level DSL section (e.g.,
  `attributes`, `actions`).

### DslBlock

Each `DslBlock` describes a section or item in the DSL:

- `blockName`: The name of the block to match (e.g., `attributes`, `actions`, `attribute`).
- `doBlock`: Whether the block requires, prohibits, or optionally allows a `do ... end` block.
- `namePattern`: (Optional) Regex to capture the name of child items (e.g.,
  `attribute :name, :string do`).
- `children`: (Optional) Array of child `DslBlock` definitions for nested parsing.
- `groupChildren`: (Optional) Whether to group child items by block name in the sidebar.

### How File Processing Works

The extension uses a two-pass system to efficiently parse Ash DSL files:

#### Pass 1: Module Discovery

1. **Find Use Declarations:** Scan the file for `use` statements (e.g., `use Ash.Resource`)
2. **Identify Configured Modules:** Filter the available `ModuleInterface` configurations to only
   those whose `declarationPattern` matches the main module in each `use` statement
   - This step trims down the full list of possible configurations to only those relevant to this
     file
   - Extensions mentioned in `use` statements (e.g., `extensions: [AshGraphql.Resource]`) are not
     parsed at this stage - they will be handled in Pass 2

#### Pass 2: DSL Block Parsing

3. **Parse DSL Blocks:** For each identified module configuration, parse the file in one pass to
   find all relevant DSL blocks and their children according to the `dslBlocks` definition
   - Top-level blocks (e.g., `attributes do`, `actions do`)
   - Child items within blocks (e.g., `attribute`, `create`, `update`) using `namePattern` and other
     config properties
   - Nested structures based on the `children` array in the configuration
   - Extensions and their DSL contributions (parsed from the `use` statements)

#### Result Usage

4. **IDE Integration:** The parsed structure populates the custom sidebar, enables quick navigation,
   and provides the foundation for (planned) CodeLens, hover, and diagnostics features

This two-pass approach ensures efficient parsing by only processing DSL blocks for modules that are
actually used in the file, while maintaining the flexibility to support multiple Ash modules in a
single file.

### Key Functions

- **`findUseDeclarations(source: string): string[]`** - Pass 1: Extracts raw `use` declaration
  strings from the file
- **`identifyConfiguredModules(useDeclarations: string[], availableConfigs: ModuleInterface[]): ModuleInterface[]`** -
  Bridge between passes: Filters available configurations to only those matching the main modules in
  the use declarations
- **`parseModuleDSL(source: string, config: ModuleInterface): ParsedSection[]`** - Pass 2: Parses
  DSL blocks according to a specific module configuration

## Example

For `Ash.Resource`, the config might specify:

- Top-level blocks: `attributes`, `actions`
- Child blocks: `attribute` (inside `attributes`), `create`, `update`, `destroy` (inside `actions`)
- Patterns for names and block structure

This allows the extension to recognize and display all relevant sections and details in an Ash
resource file.

## How to Add or Update a Module

1. Create or edit a config file in `src/dslConfigurations/` that exports a `ModuleInterface` object.
2. Define the DSL blocks and their children, specifying patterns and grouping as needed.
3. The extension will automatically use this config to parse matching Elixir files.

## Future Enhancement: Rich Context Configuration

The current configuration approach focuses on structural parsing (finding blocks, extracting names),
but there's significant opportunity to provide richer context about the data being parsed. Future
enhancements could include:

### Enhanced Block Metadata

- **Descriptions:** Human-readable explanations of what each DSL block does
- **Parameter Schemas:** Detailed information about expected parameters, types, and constraints
- **Examples:** Code snippets showing proper usage of each block
- **Documentation Links:** Direct links to relevant Ash documentation sections

### Developer Experience Features

- **Validation Context:** Rules for what makes valid block configurations
- **Relationship Mapping:** How different blocks interact or depend on each other
- **Autocomplete Data:** Suggested values and patterns for common configurations
- **Error Context:** Better error messages with suggestions for fixes

### Example Enhanced Configuration

```typescript
{
  blockName: "attribute",
  doBlock: "optional",
  namePattern: "^\\w+",
  description: "Defines a field on the resource with type and optional constraints",
  parameters: {
    name: { type: "atom", required: true, description: "The attribute name" },
    type: { type: "atom", required: true, description: "The attribute type (:string, :integer, etc.)" },
    options: { type: "keyword_list", required: false, description: "Additional attribute options" }
  },
  examples: ["attribute :name, :string", "attribute :age, :integer, default: 0"],
  documentation: "https://hexdocs.pm/ash/Ash.Resource.Dsl.html#attributes/1"
}
```

This enhanced approach would enable much richer IDE features like intelligent autocomplete,
contextual hover information, and detailed validation feedback.

## Where to Learn More

- See `moduleInterface.ts` for the full interface definition and comments.
- See existing configs (e.g., `Ash.Resource.config.ts`) for real examples.
- The main parser logic is in `moduleParser.ts`.

## Lessons Learned: Regex and Parsing for Ash DSL

When building the Ash DSL parser, we've learned several important lessons from prior work with regex
and Nearley grammar-based parsing:

### Multiline Declarations

- Regex is good for finding block starts, but unreliable for capturing entire multiline blocks,
  especially with nested content.
- Use regex to locate block starts, then switch to index-based or parser-based extraction for block
  contents.

### do ... end Nesting

- Elixir DSL blocks can be nested (`do ... end` inside another `do ... end`).
- Track nesting depth: increment on each `do`, decrement on each `end`. Only close the block when
  depth returns to zero.
- This is best done with a custom parser or token loop, not regex alone.

### do: Blocks (Single-line)

- Elixir supports single-line `do:` blocks (e.g., `attribute :name, :string, do: "value"`).
- Always check for both `do ... end` and `do:` forms when parsing blocks.

### Grammar-based Parsing (Nearley)

- Grammar-based parsers handle nesting and multiline blocks robustly.
- For advanced features (diagnostics, refactoring), consider using or integrating a grammar-based
  parser.

### Whitespace and Indentation

- Elixir is flexible with whitespace and indentation.
- Regexes should use `\s*` and `\n*` where whitespace may vary.

### Comments and Non-block Content

- Comments and non-block lines can appear anywhere; regex may match inside comments or strings.
- Pre-filter comments and strings, or use a parser that understands Elixir syntax.

**Summary:**

- Use regex for block starts, but parser logic for block contents and nesting.
- Always handle both multiline and single-line blocks.
- Track nesting for robust block extraction.
- Consider grammar-based parsing for future extensibility.
- Be flexible with whitespace and aware of comments.
