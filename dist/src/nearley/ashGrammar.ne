@{%
const moo = require('moo');

const lexer = moo.compile({
    // --- Whitespace and Comments (to be ignored by the parser) ---
    kw_ws: { match: /\s+/, lineBreaks: true },
    kw_comment: /#.*$/,

    // --- Core Elixir Keywords (essential for structural parsing) ---
    // Added word boundaries to prevent partial matches
    kw_defmodule: /defmodule\b/,
    kw_do: /do\b/,
    kw_end: /end\b/,
    kw_use: /use\b/,
    kw_require: /require\b/,
    kw_alias: /alias\b/,
    
    // --- Temporary workaround for domain parsing issue ---
    kw_domain: /domain\b/,

    // --- Specific Identifier Types ---
    // Module names with dot notation (e.g., MyApp.User, Ash.Resource)
    kw_module_name: /[A-Z][a-zA-Z_0-9]*(?:\.[A-Z][a-zA-Z_0-9]*)*/,
    
    // Simple identifiers for DSL sections, macros, variables, function names
    // Allows ?, ! at the end for predicates and bang functions
    kw_identifier: /[a-zA-Z_][a-zA-Z_0-9!?]*/,

    // --- Elixir Atom (must come before assign to avoid conflicts) ---
    // Matches atoms like :my_atom, :my_atom?, :my_atom!, :ISO8601
    // Allows ?, ! at the end, and @ within the name, but NO dots in unquoted atoms
    kw_atom: /:[a-zA-Z_][a-zA-Z_0-9@]*[!?]?/,

    // --- Operators and Punctuation ---
    kw_assign: ':', // For key: value
    kw_arrow: '->',
    kw_pipe: '|',
    kw_dot: '.',
    kw_comma: ',',
    kw_open_paren: '(',
    kw_close_paren: ')',
    kw_open_square: '[',
    kw_close_square: ']',
    kw_open_curly: '{',
    kw_close_curly: '}',

    // --- Literals ---
    // Triple-quoted strings (multi-line)
    kw_string_triple: /"""[\s\S]*?"""/,
    kw_string_double: /"(?:[^"\\]|\\.)*"(?!")/, // Double-quoted strings with escape sequences, not followed by another quote
    kw_string_single: /'(?:[^'\\]|\\.)*'/, // Single-quoted strings with escape sequences
    kw_number_literal: /-?\d+(?:\.\d+)?/, // Integer or float (e.g., 123, -4.5)
    kw_boolean: ['true', 'false', 'nil'], // Elixir's boolean and nil literals

    // --- Module Attributes ---
    kw_module_attribute: /@[a-zA-Z_][a-zA-Z_0-9]*/, // @moduledoc, @doc, etc.
});
%}

@lexer lexer

# --- Main Structure ---
# The main rule for the grammar, consuming the entire module definition.
main -> module_definition

# Whitespace handling - includes actual whitespace and comments
_ -> (%kw_ws | %kw_comment):*
__ -> (%kw_ws | %kw_comment):+

# Defines an Elixir module block: `defmodule Identifier do ... end`
module_definition -> %kw_defmodule __ %kw_module_name _ do_block

# A generic `do...end` block, which can contain any number of expressions,
# nested blocks, Ash resource declarations, map pairs, lists of arguments, or values.
do_block -> %kw_do _ do_block_content _ %kw_end
do_block_content -> (_ (module_attribute | expression | ash_dsl_section | ash_dsl_macro_with_block | ash_dsl_macro_simple | ash_resource_use | map_pair | list_of_arguments | value)):*
                  | null

# --- Module Attributes ---
# Represents module attributes like @moduledoc, @doc, etc.
module_attribute -> %kw_module_attribute _ simple_value

# --- Top-Level Ash Resource Use ---
# Represents the `use Ash.Resource, ...` declaration.
ash_resource_use -> %kw_use __ %kw_module_name _ %kw_comma _ comma_separated_map_pairs
                  | %kw_use __ %kw_module_name

# --- Common Elixir Constructs within `do...end` blocks ---

# An expression can be a require statement, an alias statement,
# a simple keyword statement, or function calls.
expression -> require_statement
            | alias_statement
            | simple_keyword_statement # For things like `defaults [:read, :destroy]`
            | function_call_no_parens # For things like `table "pets"`, `primary_key false`

# Defines a `require` statement, e.g., `require Logger`
require_statement -> %kw_require __ %kw_module_name

# Defines an `alias` statement, e.g., `alias MyApp.MyModule`
alias_statement -> %kw_alias __ %kw_module_name

# A generic rule for any identifier followed by a `do...end` block (main DSL sections).
# This covers Ash DSL blocks like `postgres do...end`, `actions do...end`, `graphql do...end`, etc.
# These are macros WITHOUT arguments
ash_dsl_section -> %kw_identifier _ do_block

# A keyword followed by macro arguments and a `do...end` block (inner DSL macros with blocks).
# This covers things like `attribute :name, :string do ... end`, `create :new do ... end`
ash_dsl_macro_with_block -> %kw_identifier __ first_argument rest_of_line do_block

# A keyword followed by macro arguments WITHOUT a do block (simple inner macros).
# This covers things like `reference(:album, ...)`, `primary?(true)`, `accept([...])`
ash_dsl_macro_simple -> %kw_identifier first_argument rest_of_line

# Extract just the first argument (what we care about for the sidebar)
first_argument -> call_argument
                | %kw_open_paren call_argument  # handle parentheses
                | null

# The rest of the arguments - consume until we hit a stopping token
rest_of_line -> rest_token:*
rest_token -> %kw_comma | %kw_open_paren | %kw_close_paren | %kw_ws | simple_value
            # But NOT %kw_do, %kw_end, or end of input - these are stopping conditions

# Defines a list of arguments, enclosed in square brackets, e.g., `[:read, :destroy]`, `[1, 2, "hello"]`
list_of_arguments -> %kw_open_square list_of_arguments_optional_content %kw_close_square
list_of_arguments_optional_content -> simple_value (%kw_comma _ simple_value):*
                                    | null

# Defines a key-value pair used in maps or keyword lists.
# Keys can be atoms or identifiers (which now includes predicate names like `trim?`).
# Special case: domain is treated as a keyword due to parsing conflicts
map_pair -> (%kw_atom | %kw_identifier | %kw_domain) _ %kw_assign _ simple_value
          | %kw_boolean # Allows boolean literals as keys (less common but possible, e.g., `store_action_name?: true`)
          | named_list_pair # e.g., `extensions: [...]`
          | named_map_pair # e.g., `constraints: {...}`
          | named_tuple_pair # e.g., `{MyChange, opts: []}`

# A list assigned to a name, e.g., `extensions: [AshPaperTrail.Resource]`
named_list_pair -> (%kw_identifier | %kw_atom) _ %kw_assign _ list_of_arguments

# A map assigned to a name, e.g., `constraints: [trim?: true, allow_empty?: false]`
named_map_pair -> (%kw_identifier | %kw_atom) _ %kw_assign _ map_literal

# A tuple pair assigned to a name, e.g., `{MyApp.Pets.Changes.ScrubMicrochip, attribute: :microchip}`
named_tuple_pair -> %kw_open_curly named_tuple_pair_optional_content %kw_close_curly
named_tuple_pair_optional_content -> simple_value (%kw_comma simple_value):*
                                   | null

# Simple keyword statement (e.g., `defaults [:read, :destroy]`, `identity :user_id`)
# The optional part allows for values, lists, maps, or tuples following the keyword.
simple_keyword_statement -> (%kw_identifier | %kw_atom) _ simple_keyword_statement_optional_arg
simple_keyword_statement_optional_arg -> simple_value | list_of_arguments | map_literal | tuple_literal
                                       | null

# --- Value Types ---
# Defines simple values that don't cause circular dependencies
simple_value -> %kw_atom
              | %kw_string_triple
              | %kw_string_double
              | %kw_string_single
              | %kw_number_literal
              | %kw_boolean
              | %kw_identifier # This covers predicate identifiers like `is_active?`
              | %kw_module_name # Module references as values (e.g., AshPostgres.DataLayer)

# Complex values that can include function calls, lists, etc.
value -> simple_value
       | list_of_arguments
       | map_literal
       | function_call
       | function_call_no_parens
       | tuple_literal

# Defines a function call, e.g., `Date.shift(Date.utc_today(), year: -25)`, `expr(owned?)`
function_call -> (%kw_identifier | %kw_atom) %kw_open_paren function_call_optional_args %kw_close_paren
function_call_optional_args -> call_argument (%kw_comma call_argument):*
                             | null

# Function call without parentheses, e.g., `table "pets"`, `attribute :name, :string`
function_call_no_parens -> (%kw_identifier | %kw_atom) __ call_argument (_ call_argument):*

# Defines the types of arguments that can be passed to a function call.
call_argument -> simple_value
               | %kw_module_name %kw_dot %kw_identifier # For module.function calls like `Date.utc_today()`

# Map Literals (can represent Elixir maps `%{}` or keyword lists `{key: value}`).
map_literal -> %kw_open_curly map_literal_optional_content %kw_close_curly
             | comma_separated_map_pairs # Used in contexts like `use Ash.Resource, data_layer: ..., domain: ...`
map_literal_optional_content -> map_pair (%kw_comma map_pair):*
                              | null

# A sequence of comma-separated map pairs, typically used in directive arguments.
comma_separated_map_pairs -> map_pair (_ %kw_comma _ map_pair):*

# Tuple Literals (e.g., `{MyApp.Pets.Changes.ScrubMicrochip, attribute: :microchip}`)
tuple_literal -> %kw_open_curly tuple_literal_optional_content %kw_close_curly
tuple_literal_optional_content -> simple_value (%kw_comma simple_value):*
                                | null