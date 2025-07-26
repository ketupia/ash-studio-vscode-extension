@{%
const moo = require('moo');

const lexer = moo.compile({
    // --- Whitespace and Comments (to be ignored by the parser) ---
    ws: { match: /\s+/, lineBreaks: true },
    comment: /#.*$/,

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

    // --- Elixir Identifier (moved up to take precedence) ---
    // Matches regular identifiers/variables, module names, and predicate names like `is_active?`
    // Allows ?, ! at the end, and dots for qualified names (e.g., `MyModule.function`).
    elixir_identifier: /[a-zA-Z_][a-zA-Z_0-9!?]*(?:\.[a-zA-Z_][a-zA-Z_0-9!?]*)*/,

    // --- Elixir Atom (must come before assign to avoid conflicts) ---
    // Matches atoms like :my_atom, :my_atom?, :my_atom!, :My.Atom
    // Allows ?, ! at the end, and dots for remote atoms.
    atom: /:[a-zA-Z_][a-zA-Z_0-9!?]*(?:\.[a-zA-Z_][a-zA-Z_0-9!?]*)?\b/,

    // --- Operators and Punctuation ---
    assign: ':', // For key: value
    arrow: '->',
    pipe: '|',
    dot: '.',
    comma: ',',
    open_paren: '(',
    close_paren: ')',
    open_square: '[',
    close_square: ']',
    open_curly: '{',
    close_curly: '}',

    // --- Literals ---
    // Triple-quoted strings (multi-line)
    string_triple: /"""[\s\S]*?"""/,
    string_double: /"(?:[^"\\]|\\.)*"(?!")/, // Double-quoted strings with escape sequences, not followed by another quote
    string_single: /'(?:[^'\\]|\\.)*'/, // Single-quoted strings with escape sequences
    number_literal: /-?\d+(?:\.\d+)?/, // Integer or float (e.g., 123, -4.5)
    boolean: ['true', 'false', 'nil'], // Elixir's boolean and nil literals

    // --- Module Attributes ---
    module_attribute: /@[a-zA-Z_][a-zA-Z_0-9]*/, // @moduledoc, @doc, etc.
});
%}

@lexer lexer

# --- Main Structure ---
# The main rule for the grammar, consuming the entire module definition.
main -> module_definition

# Whitespace handling - includes actual whitespace and comments
_ -> (%ws | %comment):*
__ -> (%ws | %comment):+

# Defines an Elixir module block: `defmodule Identifier do ... end`
module_definition -> %kw_defmodule __ %elixir_identifier _ do_block

# A generic `do...end` block, which can contain any number of expressions,
# nested blocks, Ash resource declarations, map pairs, lists of arguments, or values.
do_block -> %kw_do _ do_block_content _ %kw_end
do_block_content -> (_ (module_attribute | expression | generic_do_end_block | ash_resource_use | map_pair | list_of_arguments | value)):*
                  | null

# --- Module Attributes ---
# Represents module attributes like @moduledoc, @doc, etc.
module_attribute -> %module_attribute _ value

# --- Top-Level Ash Resource Use ---
# Represents the `use Ash.Resource, ...` declaration.
ash_resource_use -> %kw_use __ %elixir_identifier _ %comma _ comma_separated_map_pairs
                  | %kw_use __ %elixir_identifier

# --- Common Elixir Constructs within `do...end` blocks ---

# An expression can be a require statement, an alias statement,
# a simple keyword statement, or a simple keyword block.
expression -> require_statement
            | alias_statement
            | simple_keyword_statement # For things like `defaults [:read, :destroy]`
            | simple_keyword_block # For things like `create :new do ... end`
            | function_call_no_parens # For things like `table "pets"`, `attribute :name, :string`

# Defines a `require` statement, e.g., `require Logger`
require_statement -> %kw_require __ %elixir_identifier

# Defines an `alias` statement, e.g., `alias MyApp.MyModule`
alias_statement -> %kw_alias __ %elixir_identifier

# A generic rule for any identifier, atom, or string followed by a `do...end` block.
# This covers many Ash DSL blocks like `postgres do...end`, `actions do...end`, `graphql do...end`, etc.
generic_do_end_block -> (%elixir_identifier | %atom | %string_double) do_block

# Defines a list of arguments, enclosed in square brackets, e.g., `[:read, :destroy]`, `[1, 2, "hello"]`
list_of_arguments -> %open_square list_of_arguments_optional_content %close_square
list_of_arguments_optional_content -> value (%comma _ value):*
                                    | null

# Defines a key-value pair used in maps or keyword lists.
# Keys can be atoms or identifiers (which now includes predicate names like `trim?`).
# Special case: domain is treated as a keyword due to parsing conflicts
map_pair -> (%atom | %elixir_identifier | %kw_domain) _ %assign _ value
          | %boolean # Allows boolean literals as keys (less common but possible, e.g., `store_action_name?: true`)
          | named_list_pair # e.g., `extensions: [...]`
          | named_map_pair # e.g., `constraints: {...}`
          | named_tuple_pair # e.g., `{MyChange, opts: []}`

# A list assigned to a name, e.g., `extensions: [AshPaperTrail.Resource]`
named_list_pair -> (%elixir_identifier | %atom) _ %assign _ list_of_arguments

# A map assigned to a name, e.g., `constraints: [trim?: true, allow_empty?: false]`
named_map_pair -> (%elixir_identifier | %atom) _ %assign _ map_literal

# A tuple pair assigned to a name, e.g., `{MyApp.Pets.Changes.ScrubMicrochip, attribute: :microchip}`
named_tuple_pair -> %open_curly named_tuple_pair_optional_content %close_curly
named_tuple_pair_optional_content -> value (%comma value):*
                                   | null

# Simple keyword statement (e.g., `defaults [:read, :destroy]`, `identity :user_id`)
# The optional part allows for values, lists, maps, or tuples following the keyword.
simple_keyword_statement -> (%elixir_identifier | %atom) _ simple_keyword_statement_optional_arg
simple_keyword_statement_optional_arg -> value | list_of_arguments | map_literal | tuple_literal
                                       | null

# A keyword followed by an optional atom/identifier and a `do...end` block (e.g., `create :new do ... end`)
simple_keyword_block -> (%elixir_identifier | %atom) simple_keyword_block_optional_identifier do_block
simple_keyword_block_optional_identifier -> (%atom | %elixir_identifier)
                                           | null

# --- Value Types ---
# Defines the various types of values that can appear in the DSL.
value -> %atom
       | %string_triple
       | %string_double
       | %string_single
       | %number_literal
       | %boolean
       | %elixir_identifier # This covers predicate identifiers like `is_active?`
       | list_of_arguments
       | map_literal
       | function_call
       | function_call_no_parens
       | tuple_literal

# Defines a function call, e.g., `Date.shift(Date.utc_today(), year: -25)`, `expr(owned?)`
function_call -> (%elixir_identifier | %atom) %open_paren function_call_optional_args %close_paren
function_call_optional_args -> call_argument (%comma call_argument):*
                             | null

# Function call without parentheses, e.g., `table "pets"`, `attribute :name, :string`
function_call_no_parens -> (%elixir_identifier | %atom) __ call_argument (_ call_argument):*

# Defines the types of arguments that can be passed to a function call.
call_argument -> value
               | map_pair
               | list_of_arguments
               | %elixir_identifier %dot %elixir_identifier # For module.function calls like `Date.utc_today()`

# Map Literals (can represent Elixir maps `%{}` or keyword lists `{key: value}`).
map_literal -> %open_curly map_literal_optional_content %close_curly
             | comma_separated_map_pairs # Used in contexts like `use Ash.Resource, data_layer: ..., domain: ...`
map_literal_optional_content -> map_pair (%comma map_pair):*
                              | null

# A sequence of comma-separated map pairs, typically used in directive arguments.
comma_separated_map_pairs -> map_pair (_ %comma _ map_pair):*

# Tuple Literals (e.g., `{MyApp.Pets.Changes.ScrubMicrochip, attribute: :microchip}`)
tuple_literal -> %open_curly tuple_literal_optional_content %close_curly
tuple_literal_optional_content -> value (%comma value):*
                                | null