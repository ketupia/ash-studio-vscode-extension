// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["module_definition"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_ws") ? {type: "kw_ws"} : kw_ws)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comment") ? {type: "kw_comment"} : kw_comment)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_ws") ? {type: "kw_ws"} : kw_ws)]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comment") ? {type: "kw_comment"} : kw_comment)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1$subexpression$1"]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("kw_ws") ? {type: "kw_ws"} : kw_ws)]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("kw_comment") ? {type: "kw_comment"} : kw_comment)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "__$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "module_definition", "symbols": [(lexer.has("kw_defmodule") ? {type: "kw_defmodule"} : kw_defmodule), "__", (lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name), "_", "do_block"]},
    {"name": "do_block", "symbols": [(lexer.has("kw_do") ? {type: "kw_do"} : kw_do), "_", "do_block_content", "_", (lexer.has("kw_end") ? {type: "kw_end"} : kw_end)]},
    {"name": "do_block_content$ebnf$1", "symbols": []},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["module_attribute"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["expression"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["ash_dsl_section"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["ash_dsl_macro_with_block"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["ash_dsl_macro_simple"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["ash_resource_use"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["map_pair"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["list_of_arguments"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["value"]},
    {"name": "do_block_content$ebnf$1$subexpression$1", "symbols": ["_", "do_block_content$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "do_block_content$ebnf$1", "symbols": ["do_block_content$ebnf$1", "do_block_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "do_block_content", "symbols": ["do_block_content$ebnf$1"]},
    {"name": "do_block_content", "symbols": []},
    {"name": "module_attribute", "symbols": [(lexer.has("kw_module_attribute") ? {type: "kw_module_attribute"} : kw_module_attribute), "_", "simple_value"]},
    {"name": "ash_resource_use", "symbols": [(lexer.has("kw_use") ? {type: "kw_use"} : kw_use), "__", (lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name), "_", (lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "_", "comma_separated_map_pairs"]},
    {"name": "ash_resource_use", "symbols": [(lexer.has("kw_use") ? {type: "kw_use"} : kw_use), "__", (lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name)]},
    {"name": "expression", "symbols": ["require_statement"]},
    {"name": "expression", "symbols": ["alias_statement"]},
    {"name": "expression", "symbols": ["simple_keyword_statement"]},
    {"name": "expression", "symbols": ["function_call_no_parens"]},
    {"name": "require_statement", "symbols": [(lexer.has("kw_require") ? {type: "kw_require"} : kw_require), "__", (lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name)]},
    {"name": "alias_statement", "symbols": [(lexer.has("kw_alias") ? {type: "kw_alias"} : kw_alias), "__", (lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name)]},
    {"name": "ash_dsl_section", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier), "_", "do_block"]},
    {"name": "ash_dsl_macro_with_block", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier), "__", "first_argument", "rest_of_line", "do_block"]},
    {"name": "ash_dsl_macro_simple", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier), "first_argument", "rest_of_line"]},
    {"name": "first_argument", "symbols": ["call_argument"]},
    {"name": "first_argument", "symbols": [(lexer.has("kw_open_paren") ? {type: "kw_open_paren"} : kw_open_paren), "call_argument"]},
    {"name": "first_argument", "symbols": []},
    {"name": "rest_of_line$ebnf$1", "symbols": []},
    {"name": "rest_of_line$ebnf$1", "symbols": ["rest_of_line$ebnf$1", "rest_token"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "rest_of_line", "symbols": ["rest_of_line$ebnf$1"]},
    {"name": "rest_token", "symbols": [(lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma)]},
    {"name": "rest_token", "symbols": [(lexer.has("kw_open_paren") ? {type: "kw_open_paren"} : kw_open_paren)]},
    {"name": "rest_token", "symbols": [(lexer.has("kw_close_paren") ? {type: "kw_close_paren"} : kw_close_paren)]},
    {"name": "rest_token", "symbols": [(lexer.has("kw_ws") ? {type: "kw_ws"} : kw_ws)]},
    {"name": "rest_token", "symbols": ["simple_value"]},
    {"name": "list_of_arguments", "symbols": [(lexer.has("kw_open_square") ? {type: "kw_open_square"} : kw_open_square), "list_of_arguments_optional_content", (lexer.has("kw_close_square") ? {type: "kw_close_square"} : kw_close_square)]},
    {"name": "list_of_arguments_optional_content$ebnf$1", "symbols": []},
    {"name": "list_of_arguments_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "_", "simple_value"]},
    {"name": "list_of_arguments_optional_content$ebnf$1", "symbols": ["list_of_arguments_optional_content$ebnf$1", "list_of_arguments_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "list_of_arguments_optional_content", "symbols": ["simple_value", "list_of_arguments_optional_content$ebnf$1"]},
    {"name": "list_of_arguments_optional_content", "symbols": []},
    {"name": "map_pair$subexpression$1", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "map_pair$subexpression$1", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "map_pair$subexpression$1", "symbols": [(lexer.has("kw_domain") ? {type: "kw_domain"} : kw_domain)]},
    {"name": "map_pair", "symbols": ["map_pair$subexpression$1", "_", (lexer.has("kw_assign") ? {type: "kw_assign"} : kw_assign), "_", "simple_value"]},
    {"name": "map_pair", "symbols": [(lexer.has("kw_boolean") ? {type: "kw_boolean"} : kw_boolean)]},
    {"name": "map_pair", "symbols": ["named_list_pair"]},
    {"name": "map_pair", "symbols": ["named_map_pair"]},
    {"name": "map_pair", "symbols": ["named_tuple_pair"]},
    {"name": "named_list_pair$subexpression$1", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "named_list_pair$subexpression$1", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "named_list_pair", "symbols": ["named_list_pair$subexpression$1", "_", (lexer.has("kw_assign") ? {type: "kw_assign"} : kw_assign), "_", "list_of_arguments"]},
    {"name": "named_map_pair$subexpression$1", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "named_map_pair$subexpression$1", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "named_map_pair", "symbols": ["named_map_pair$subexpression$1", "_", (lexer.has("kw_assign") ? {type: "kw_assign"} : kw_assign), "_", "map_literal"]},
    {"name": "named_tuple_pair", "symbols": [(lexer.has("kw_open_curly") ? {type: "kw_open_curly"} : kw_open_curly), "named_tuple_pair_optional_content", (lexer.has("kw_close_curly") ? {type: "kw_close_curly"} : kw_close_curly)]},
    {"name": "named_tuple_pair_optional_content$ebnf$1", "symbols": []},
    {"name": "named_tuple_pair_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "simple_value"]},
    {"name": "named_tuple_pair_optional_content$ebnf$1", "symbols": ["named_tuple_pair_optional_content$ebnf$1", "named_tuple_pair_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "named_tuple_pair_optional_content", "symbols": ["simple_value", "named_tuple_pair_optional_content$ebnf$1"]},
    {"name": "named_tuple_pair_optional_content", "symbols": []},
    {"name": "simple_keyword_statement$subexpression$1", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "simple_keyword_statement$subexpression$1", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "simple_keyword_statement", "symbols": ["simple_keyword_statement$subexpression$1", "_", "simple_keyword_statement_optional_arg"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["simple_value"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["list_of_arguments"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["map_literal"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["tuple_literal"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": []},
    {"name": "simple_value", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_string_triple") ? {type: "kw_string_triple"} : kw_string_triple)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_string_double") ? {type: "kw_string_double"} : kw_string_double)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_string_single") ? {type: "kw_string_single"} : kw_string_single)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_number_literal") ? {type: "kw_number_literal"} : kw_number_literal)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_boolean") ? {type: "kw_boolean"} : kw_boolean)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "simple_value", "symbols": [(lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name)]},
    {"name": "value", "symbols": ["simple_value"]},
    {"name": "value", "symbols": ["list_of_arguments"]},
    {"name": "value", "symbols": ["map_literal"]},
    {"name": "value", "symbols": ["function_call"]},
    {"name": "value", "symbols": ["function_call_no_parens"]},
    {"name": "value", "symbols": ["tuple_literal"]},
    {"name": "function_call$subexpression$1", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "function_call$subexpression$1", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "function_call", "symbols": ["function_call$subexpression$1", (lexer.has("kw_open_paren") ? {type: "kw_open_paren"} : kw_open_paren), "function_call_optional_args", (lexer.has("kw_close_paren") ? {type: "kw_close_paren"} : kw_close_paren)]},
    {"name": "function_call_optional_args$ebnf$1", "symbols": []},
    {"name": "function_call_optional_args$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "call_argument"]},
    {"name": "function_call_optional_args$ebnf$1", "symbols": ["function_call_optional_args$ebnf$1", "function_call_optional_args$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "function_call_optional_args", "symbols": ["call_argument", "function_call_optional_args$ebnf$1"]},
    {"name": "function_call_optional_args", "symbols": []},
    {"name": "function_call_no_parens$subexpression$1", "symbols": [(lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "function_call_no_parens$subexpression$1", "symbols": [(lexer.has("kw_atom") ? {type: "kw_atom"} : kw_atom)]},
    {"name": "function_call_no_parens$ebnf$1", "symbols": []},
    {"name": "function_call_no_parens$ebnf$1$subexpression$1", "symbols": ["_", "call_argument"]},
    {"name": "function_call_no_parens$ebnf$1", "symbols": ["function_call_no_parens$ebnf$1", "function_call_no_parens$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "function_call_no_parens", "symbols": ["function_call_no_parens$subexpression$1", "__", "call_argument", "function_call_no_parens$ebnf$1"]},
    {"name": "call_argument", "symbols": ["simple_value"]},
    {"name": "call_argument", "symbols": [(lexer.has("kw_module_name") ? {type: "kw_module_name"} : kw_module_name), (lexer.has("kw_dot") ? {type: "kw_dot"} : kw_dot), (lexer.has("kw_identifier") ? {type: "kw_identifier"} : kw_identifier)]},
    {"name": "map_literal", "symbols": [(lexer.has("kw_open_curly") ? {type: "kw_open_curly"} : kw_open_curly), "map_literal_optional_content", (lexer.has("kw_close_curly") ? {type: "kw_close_curly"} : kw_close_curly)]},
    {"name": "map_literal", "symbols": ["comma_separated_map_pairs"]},
    {"name": "map_literal_optional_content$ebnf$1", "symbols": []},
    {"name": "map_literal_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "map_pair"]},
    {"name": "map_literal_optional_content$ebnf$1", "symbols": ["map_literal_optional_content$ebnf$1", "map_literal_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "map_literal_optional_content", "symbols": ["map_pair", "map_literal_optional_content$ebnf$1"]},
    {"name": "map_literal_optional_content", "symbols": []},
    {"name": "comma_separated_map_pairs$ebnf$1", "symbols": []},
    {"name": "comma_separated_map_pairs$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "_", "map_pair"]},
    {"name": "comma_separated_map_pairs$ebnf$1", "symbols": ["comma_separated_map_pairs$ebnf$1", "comma_separated_map_pairs$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "comma_separated_map_pairs", "symbols": ["map_pair", "comma_separated_map_pairs$ebnf$1"]},
    {"name": "tuple_literal", "symbols": [(lexer.has("kw_open_curly") ? {type: "kw_open_curly"} : kw_open_curly), "tuple_literal_optional_content", (lexer.has("kw_close_curly") ? {type: "kw_close_curly"} : kw_close_curly)]},
    {"name": "tuple_literal_optional_content$ebnf$1", "symbols": []},
    {"name": "tuple_literal_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("kw_comma") ? {type: "kw_comma"} : kw_comma), "simple_value"]},
    {"name": "tuple_literal_optional_content$ebnf$1", "symbols": ["tuple_literal_optional_content$ebnf$1", "tuple_literal_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "tuple_literal_optional_content", "symbols": ["simple_value", "tuple_literal_optional_content$ebnf$1"]},
    {"name": "tuple_literal_optional_content", "symbols": []}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
