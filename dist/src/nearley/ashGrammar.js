// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["module_definition"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1$subexpression$1"]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "__$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "module_definition", "symbols": [(lexer.has("kw_defmodule") ? {type: "kw_defmodule"} : kw_defmodule), "__", (lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier), "_", "do_block"]},
    {"name": "do_block", "symbols": [(lexer.has("kw_do") ? {type: "kw_do"} : kw_do), "_", "do_block_content", "_", (lexer.has("kw_end") ? {type: "kw_end"} : kw_end)]},
    {"name": "do_block_content$ebnf$1", "symbols": []},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["module_attribute"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["expression"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["generic_do_end_block"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["ash_resource_use"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["map_pair"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["list_of_arguments"]},
    {"name": "do_block_content$ebnf$1$subexpression$1$subexpression$1", "symbols": ["value"]},
    {"name": "do_block_content$ebnf$1$subexpression$1", "symbols": ["_", "do_block_content$ebnf$1$subexpression$1$subexpression$1"]},
    {"name": "do_block_content$ebnf$1", "symbols": ["do_block_content$ebnf$1", "do_block_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "do_block_content", "symbols": ["do_block_content$ebnf$1"]},
    {"name": "do_block_content", "symbols": []},
    {"name": "module_attribute", "symbols": [(lexer.has("module_attribute") ? {type: "module_attribute"} : module_attribute), "_", "value"]},
    {"name": "ash_resource_use", "symbols": [(lexer.has("kw_use") ? {type: "kw_use"} : kw_use), "__", (lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "comma_separated_map_pairs"]},
    {"name": "ash_resource_use", "symbols": [(lexer.has("kw_use") ? {type: "kw_use"} : kw_use), "__", (lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "expression", "symbols": ["require_statement"]},
    {"name": "expression", "symbols": ["alias_statement"]},
    {"name": "expression", "symbols": ["simple_keyword_statement"]},
    {"name": "expression", "symbols": ["simple_keyword_block"]},
    {"name": "expression", "symbols": ["function_call_no_parens"]},
    {"name": "require_statement", "symbols": [(lexer.has("kw_require") ? {type: "kw_require"} : kw_require), "__", (lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "alias_statement", "symbols": [(lexer.has("kw_alias") ? {type: "kw_alias"} : kw_alias), "__", (lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "generic_do_end_block$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "generic_do_end_block$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "generic_do_end_block$subexpression$1", "symbols": [(lexer.has("string_double") ? {type: "string_double"} : string_double)]},
    {"name": "generic_do_end_block", "symbols": ["generic_do_end_block$subexpression$1", "do_block"]},
    {"name": "list_of_arguments", "symbols": [(lexer.has("open_square") ? {type: "open_square"} : open_square), "list_of_arguments_optional_content", (lexer.has("close_square") ? {type: "close_square"} : close_square)]},
    {"name": "list_of_arguments_optional_content$ebnf$1", "symbols": []},
    {"name": "list_of_arguments_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "_", "value"]},
    {"name": "list_of_arguments_optional_content$ebnf$1", "symbols": ["list_of_arguments_optional_content$ebnf$1", "list_of_arguments_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "list_of_arguments_optional_content", "symbols": ["value", "list_of_arguments_optional_content$ebnf$1"]},
    {"name": "list_of_arguments_optional_content", "symbols": []},
    {"name": "map_pair$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "map_pair$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "map_pair$subexpression$1", "symbols": [(lexer.has("kw_domain") ? {type: "kw_domain"} : kw_domain)]},
    {"name": "map_pair", "symbols": ["map_pair$subexpression$1", "_", (lexer.has("assign") ? {type: "assign"} : assign), "_", "value"]},
    {"name": "map_pair", "symbols": [(lexer.has("boolean") ? {type: "boolean"} : boolean)]},
    {"name": "map_pair", "symbols": ["named_list_pair"]},
    {"name": "map_pair", "symbols": ["named_map_pair"]},
    {"name": "map_pair", "symbols": ["named_tuple_pair"]},
    {"name": "named_list_pair$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "named_list_pair$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "named_list_pair", "symbols": ["named_list_pair$subexpression$1", "_", (lexer.has("assign") ? {type: "assign"} : assign), "_", "list_of_arguments"]},
    {"name": "named_map_pair$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "named_map_pair$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "named_map_pair", "symbols": ["named_map_pair$subexpression$1", "_", (lexer.has("assign") ? {type: "assign"} : assign), "_", "map_literal"]},
    {"name": "named_tuple_pair", "symbols": [(lexer.has("open_curly") ? {type: "open_curly"} : open_curly), "named_tuple_pair_optional_content", (lexer.has("close_curly") ? {type: "close_curly"} : close_curly)]},
    {"name": "named_tuple_pair_optional_content$ebnf$1", "symbols": []},
    {"name": "named_tuple_pair_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "value"]},
    {"name": "named_tuple_pair_optional_content$ebnf$1", "symbols": ["named_tuple_pair_optional_content$ebnf$1", "named_tuple_pair_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "named_tuple_pair_optional_content", "symbols": ["value", "named_tuple_pair_optional_content$ebnf$1"]},
    {"name": "named_tuple_pair_optional_content", "symbols": []},
    {"name": "simple_keyword_statement$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "simple_keyword_statement$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "simple_keyword_statement", "symbols": ["simple_keyword_statement$subexpression$1", "_", "simple_keyword_statement_optional_arg"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["value"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["list_of_arguments"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["map_literal"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": ["tuple_literal"]},
    {"name": "simple_keyword_statement_optional_arg", "symbols": []},
    {"name": "simple_keyword_block$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "simple_keyword_block$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "simple_keyword_block", "symbols": ["simple_keyword_block$subexpression$1", "simple_keyword_block_optional_identifier", "do_block"]},
    {"name": "simple_keyword_block_optional_identifier$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "simple_keyword_block_optional_identifier$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "simple_keyword_block_optional_identifier", "symbols": ["simple_keyword_block_optional_identifier$subexpression$1"]},
    {"name": "simple_keyword_block_optional_identifier", "symbols": []},
    {"name": "value", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "value", "symbols": [(lexer.has("string_triple") ? {type: "string_triple"} : string_triple)]},
    {"name": "value", "symbols": [(lexer.has("string_double") ? {type: "string_double"} : string_double)]},
    {"name": "value", "symbols": [(lexer.has("string_single") ? {type: "string_single"} : string_single)]},
    {"name": "value", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)]},
    {"name": "value", "symbols": [(lexer.has("boolean") ? {type: "boolean"} : boolean)]},
    {"name": "value", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "value", "symbols": ["list_of_arguments"]},
    {"name": "value", "symbols": ["map_literal"]},
    {"name": "value", "symbols": ["function_call"]},
    {"name": "value", "symbols": ["function_call_no_parens"]},
    {"name": "value", "symbols": ["tuple_literal"]},
    {"name": "function_call$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "function_call$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "function_call", "symbols": ["function_call$subexpression$1", (lexer.has("open_paren") ? {type: "open_paren"} : open_paren), "function_call_optional_args", (lexer.has("close_paren") ? {type: "close_paren"} : close_paren)]},
    {"name": "function_call_optional_args$ebnf$1", "symbols": []},
    {"name": "function_call_optional_args$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "call_argument"]},
    {"name": "function_call_optional_args$ebnf$1", "symbols": ["function_call_optional_args$ebnf$1", "function_call_optional_args$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "function_call_optional_args", "symbols": ["call_argument", "function_call_optional_args$ebnf$1"]},
    {"name": "function_call_optional_args", "symbols": []},
    {"name": "function_call_no_parens$subexpression$1", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "function_call_no_parens$subexpression$1", "symbols": [(lexer.has("atom") ? {type: "atom"} : atom)]},
    {"name": "function_call_no_parens$ebnf$1", "symbols": []},
    {"name": "function_call_no_parens$ebnf$1$subexpression$1", "symbols": ["_", "call_argument"]},
    {"name": "function_call_no_parens$ebnf$1", "symbols": ["function_call_no_parens$ebnf$1", "function_call_no_parens$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "function_call_no_parens", "symbols": ["function_call_no_parens$subexpression$1", "__", "call_argument", "function_call_no_parens$ebnf$1"]},
    {"name": "call_argument", "symbols": ["value"]},
    {"name": "call_argument", "symbols": ["map_pair"]},
    {"name": "call_argument", "symbols": ["list_of_arguments"]},
    {"name": "call_argument", "symbols": [(lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier), (lexer.has("dot") ? {type: "dot"} : dot), (lexer.has("elixir_identifier") ? {type: "elixir_identifier"} : elixir_identifier)]},
    {"name": "map_literal", "symbols": [(lexer.has("open_curly") ? {type: "open_curly"} : open_curly), "map_literal_optional_content", (lexer.has("close_curly") ? {type: "close_curly"} : close_curly)]},
    {"name": "map_literal", "symbols": ["comma_separated_map_pairs"]},
    {"name": "map_literal_optional_content$ebnf$1", "symbols": []},
    {"name": "map_literal_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "map_pair"]},
    {"name": "map_literal_optional_content$ebnf$1", "symbols": ["map_literal_optional_content$ebnf$1", "map_literal_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "map_literal_optional_content", "symbols": ["map_pair", "map_literal_optional_content$ebnf$1"]},
    {"name": "map_literal_optional_content", "symbols": []},
    {"name": "comma_separated_map_pairs$ebnf$1", "symbols": []},
    {"name": "comma_separated_map_pairs$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "map_pair"]},
    {"name": "comma_separated_map_pairs$ebnf$1", "symbols": ["comma_separated_map_pairs$ebnf$1", "comma_separated_map_pairs$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "comma_separated_map_pairs", "symbols": ["map_pair", "comma_separated_map_pairs$ebnf$1"]},
    {"name": "tuple_literal", "symbols": [(lexer.has("open_curly") ? {type: "open_curly"} : open_curly), "tuple_literal_optional_content", (lexer.has("close_curly") ? {type: "close_curly"} : close_curly)]},
    {"name": "tuple_literal_optional_content$ebnf$1", "symbols": []},
    {"name": "tuple_literal_optional_content$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "value"]},
    {"name": "tuple_literal_optional_content$ebnf$1", "symbols": ["tuple_literal_optional_content$ebnf$1", "tuple_literal_optional_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "tuple_literal_optional_content", "symbols": ["value", "tuple_literal_optional_content$ebnf$1"]},
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
