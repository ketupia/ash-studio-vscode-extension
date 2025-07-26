# Ash DSL Parsing Checklist

This document tracks the parsing capabilities of our Nearley grammar for Elixir/Ash DSL code.

## Basic Module Structure

- ✅ `defmodule ModuleName do ... end` - Basic module definition
- ✅ Nested `do...end` blocks within modules
- ✅ Whitespace handling and indentation

## Module Attributes

- ✅ `@moduledoc` - Module documentation attribute
- ✅ `@moduledoc """multi-line string"""` - Module documentation with triple-quoted strings
- ✅ `@doc` - Function documentation attribute
- ✅ Other module attributes like `@behaviour`, `@impl`, etc.

## Import/Require/Alias Statements

- ✅ `require Ash.Query` - Require statements
- ✅ `require Ash.Expr` - Multiple require statements
- ✅ `alias Module.Name` - Alias statements
- ✅ `alias MyApp.Pets.Types.Species` - Alias with nested module names

## String Literals

- ✅ `"double quoted strings"` - Basic double-quoted strings
- ✅ `'single quoted strings'` - Single-quoted strings
- ✅ `"""multi-line strings"""` - Triple-quoted multi-line strings
- ✅ String escaping with backslashes

## Basic Use Statements

- ✅ `use Ash.Resource` - Simple use statement without options
- 🔄 `use Ash.Resource, options...` - Use statement with options (partially working)

## Use Statement Options (Key-Value Pairs)

- ✅ `data_layer: AshPostgres.DataLayer` - Module reference as value
- ✅ `domain: MyApp.Pets` - Module reference as value
- ✅ `notifiers: [Ash.Notifier.PubSub]` - List with module references
- ✅ `authorizers: [Ash.Policy.Authorizer]` - List with module references
- ✅ `extensions: [AshPaperTrail.Resource]` - List with module references

## Identifiers and References

- ✅ `simple_identifier` - Basic identifiers
- ✅ `Module.Name` - Dotted module names
- ✅ `predicate?` - Predicate identifiers with `?`
- ✅ `action!` - Identifiers with `!`
- ✅ Module references as values in key-value pairs

## Lists and Collections

- ✅ `[item1, item2, item3]` - Basic lists
- ✅ `[:atom1, :atom2]` - Lists of atoms
- ✅ `["string1", "string2"]` - Lists of strings
- ✅ `[Module.Name]` - Lists containing module references
- ❌ `[]` - Empty lists
- ❌ Nested lists

## Maps and Keyword Lists

- ✅ `key: value` - Basic key-value pairs
- ✅ `atom: "string"` - Atom keys with string values
- ✅ `:atom_key => value` - Map syntax with arrow
- 🔄 `{key: value, key2: value2}` - Map literals in braces
- ❌ `%{key: value}` - Elixir map syntax with percent

## Atoms and Keywords

- ✅ `:atom` - Basic atoms
- ✅ `:my_atom` - Atoms with underscores
- ✅ `:Module.atom` - Remote atoms
- ✅ `atom?` - Predicate atoms
- ✅ Boolean atoms: `true`, `false`, `nil`

## Numbers and Literals

- ✅ `123` - Integer literals
- ✅ `-456` - Negative integers
- ✅ `12.34` - Float literals
- ✅ `-5.67` - Negative floats

## Function Calls

- ❌ `function()` - Function calls without arguments
- ❌ `function(arg1, arg2)` - Function calls with arguments
- ❌ `Module.function()` - Qualified function calls
- ❌ `Date.shift(Date.utc_today(), year: -25)` - Complex function calls

## Ash DSL Blocks

- ✅ `postgres do ... end` - Postgres-specific blocks
- ✅ `actions do ... end` - Actions blocks (via generic_do_end_block)
- ✅ `attributes do ... end` - Attributes blocks (via generic_do_end_block)
- ✅ `relationships do ... end` - Relationships blocks (via generic_do_end_block)
- ✅ `graphql do ... end` - GraphQL blocks (via generic_do_end_block)
- ✅ `policies do ... end` - Policy blocks (via generic_do_end_block)

## Ash DSL Content

- ❌ `attribute :name, :string` - Attribute definitions
- ❌ `belongs_to :owner, User` - Relationship definitions
- ❌ `action :create, :create` - Action definitions
- ❌ `policy action_type(:read)` - Policy definitions

## Comments

- 🔄 `# Single line comments` - Line comments (grammar updated, needs testing)
- ❌ `## Documentation comments` - Documentation comments

## Development Workflow

### Quick Start for New Sessions

1. **Test current state**: `npm run test:parser`
2. **Check failed tests**: Look for specific error patterns in test output
3. **Identify next priority**: Check "Next Priority Items" section below
4. **Work incrementally**: Fix one feature at a time, test after each change

### Grammar Development Process

1. **Compile grammar**: `npx nearleyc src/nearley/ashGrammar.ne -o src/nearley/ashGrammar.js`
2. **Run tests**: `npm run test:parser`
3. **Debug failures**: Check test output for specific syntax errors
4. **Iterate**: Modify grammar, recompile, test again
5. **Update docs**: Mark items as ✅ when working, add new test cases

## Recent Major Progress (July 2025)

### ✅ Critical Fixes Completed

1. **Domain Keyword Parsing Issue** - RESOLVED

   - **Problem**: `domain` was being tokenized as `do` + `main` instead of a single keyword
   - **Solution**: Added word boundaries (`\b`) to all keyword patterns in lexer
   - **Impact**: Fixed domain parsing across all variations, improved test success from 33 to 41 passing tests
   - **Files**: Updated lexer rules in `ashGrammar.ne` for all keywords (`/do\b/`, `/domain\b/`, etc.)

2. **List Parsing with Whitespace** - RESOLVED

   - **Problem**: Lists failed to parse when there was whitespace after commas
   - **Solution**: Modified `list_of_arguments_optional_content` rule to handle `(%comma _ value):*`
   - **Impact**: All list parsing with spaces now works correctly
   - **Example**: `[item1, item2, item3]` now parses successfully

3. **Function Calls Without Parentheses** - IMPLEMENTED
   - **Problem**: `table "pets"` style function calls weren't supported
   - **Solution**: Added `function_call_no_parens` rule: `(%elixir_identifier | %atom) __ call_argument (_ call_argument):*`
   - **Impact**: Supports Elixir's common pattern of function calls without parentheses
   - **Example**: `table "pets"`, `attribute :name, :string` style calls now recognized

### Current Status (41/51 tests passing - 80% success rate)

**✅ Working Well**:

- Module structure and basic DSL blocks
- All domain variations (`domain: Module`, `domain Module`, etc.)
- Function calls with and without parentheses
- List parsing with proper whitespace handling
- Module attributes and use statements
- String literals (all types)

**🔄 Remaining Issues (10 failing tests)**:

- Complex nested DSL block parsing (postgres blocks, actions blocks)
- Some edge cases in DSL block content parsing
- Certain combinations of simple keyword statements inside blocks

### Next Session Priorities

1. **Integration Work** - Wire parser output to extension features

   - Connect to QuickPick functionality
   - Connect to Sidebar provider
   - Implement actual AST consumption in extension

2. **Remaining Parser Issues** (if time permits)
   - Investigate nested DSL block parsing failures
   - Fix simple keyword statements inside postgres/actions blocks
   - Add support for more complex Ash DSL patterns

### Grammar Architecture Notes

- **Lexer Rule Ordering**: Critical for proper tokenization - specific tokens first, general tokens last
- **Word Boundaries**: Essential for keywords to prevent partial matches (`domain` vs `do` + `main`)
- **Whitespace Handling**: Two patterns used - `_` (optional) and `__` (mandatory) for different contexts
- **Function Call Patterns**: Supports both `func(args)` and `func args` styles common in Elixir
- **DSL Block Structure**: Uses generic `do_block` pattern that can contain various expression types

## Current Grammar Issues (From Latest Test Run)

Based on recent test failures, these are the immediate issues to fix:

1. **Comments not working**: Added to grammar but whitespace rules need (%ws | %comment)
2. **Complex use statements failing**: Parser expects more map pairs than provided
3. **Module content parsing**: Some valid Elixir content not recognized in do blocks
4. **Lists parsing**: Empty lists and some complex list structures failing

### Grammar File Locations

- **Source**: `src/nearley/ashGrammar.ne` (edit this file)
- **Compiled**: `src/nearley/ashGrammar.js` (generated, don't edit directly)
- **Tests**: `test/*.test.js` (10 domain-specific test files)
- **Helpers**: `test/parser-helpers.js` (testing utilities)

### Debugging Tips

- **Verbose errors**: Test failures show exact line/column and expected tokens
- **Incremental testing**: Start with simple cases, build to complex
- **Rule order matters**: More specific rules should come before general ones in grammar
- **Lexer precedence**: Token order in lexer affects matching (string_triple before string_double)

## Advanced Constructs

- ❌ Pipes: `|>`
- ❌ Pattern matching: `{:ok, result}`
- ❌ Tuples: `{a, b, c}`
- ❌ Anonymous functions: `fn x -> x + 1 end`
- ❌ Case statements: `case value do ... end`
- ❌ If statements: `if condition do ... end`

## Current Parsing Status

✅ **Working (20+ constructs)**: Module structure, attributes, require/alias, strings (including triple-quoted), module references as values, lists with module references, basic DSL blocks
🔄 **Partially Working (3 issues)**: Empty collections, complex multi-line use statements, nested DSL blocks
❌ **Not Implemented (15+ advanced features)**: Function calls, advanced Elixir constructs, specific Ash DSL content

## Known Issues

1. ~~**Module references as values**: `AshPostgres.DataLayer` not recognized as valid value in key-value pairs~~ ✅ FIXED
2. ~~**Lists with module references**: `[Ash.Notifier.PubSub]` not parsing correctly~~ ✅ FIXED
3. ~~**Complex use statement options**: Multi-line use statements with nested structures~~ ✅ FIXED
4. **Empty collections**: Empty lists `[]` and maps `{}` not handled
5. **DSL block priorities**: Parser occasionally gets confused by rule precedence
6. **Whitespace at end of file**: Parser expects exact end of input

## Next Priority Items

### Immediate Fixes (Session Continuation Priorities)

1. **Fix comments support** - Grammar has comments in lexer but whitespace rules need updating

   - Current: `_ -> %ws:*`
   - Needed: `_ -> (%ws | %comment):*`
   - Impact: Enables `# comment` lines in all Elixir code

2. **Fix complex use statements** - Multi-line use statements with trailing commas failing

   - Issue: Parser expects more map pairs after domain: Module pattern
   - Test case: `use Ash.Resource, data_layer: AshPostgres.DataLayer, domain: MyApp.Pets`
   - Solution: Review comma_separated_map_pairs rule

3. **Add empty collection support** - `[]` and `{}` not handled

   - Impact: Common in real Elixir code
   - Implementation: Add optional content rules to list/map patterns

4. **Function call parsing** - Next major feature for Ash DSL content
   - Examples: `attribute :name, :string`, `belongs_to :owner, User`
   - Foundation for actual Ash DSL content parsing

### Medium Term (Next Session Goals)

1. ~~Fix module references as values in use statement options~~ ✅ DONE
2. ~~Add support for lists containing module references~~ ✅ DONE
3. ~~Implement basic Ash DSL blocks (postgres, actions, attributes)~~ ✅ DONE
4. Add function call parsing
5. Handle empty collections
6. Implement specific Ash DSL content (attribute definitions, relationships, etc.)

### Current Working State Summary

**✅ Solid Foundation (32 passing tests)**:

- Module structure with do-end blocks
- Module attributes (@moduledoc, @doc)
- Import/require/alias statements
- All string types (single, double, triple-quoted)
- Use statements with module references
- Lists with module references
- Basic identifiers and atoms
- Number literals
- Generic DSL blocks (postgres, actions, etc.)

**🔄 Partially Working (needs fixes)**:

- Comments (grammar updated, not tested)
- Complex multi-option use statements
- Some edge cases in whitespace handling## Test Files Used

- `test_simple.ex` - Complex Pet resource (current main test)
- `test_attributes.ex` - Module attributes testing
- `test_two_attrs.ex` - Multiple attributes testing
- `examples/resources/artist.ex` - Real-world example

## Testing Approach

### Comprehensive Test Suite

The parser now has a comprehensive Mocha-based test suite located in the `/test` directory:

#### Test Structure

- **`test/parser-helpers.js`** - Testing utilities and helper functions

  - `assertParses(code, description)` - Asserts that code parses successfully
  - `assertDoesNotParse(code, description)` - Asserts that code fails to parse
  - `testParsing(code, description)` - Returns boolean success/failure
  - Shared grammar instance for consistency

- **`test/parser.test.js`** - Main test suite loader that imports all test modules

#### Test Organization by Domain

1. **`basic-module.test.js`** - Module structure, defmodule, do-end blocks
2. **`module-attributes.test.js`** - @moduledoc, @doc, custom attributes
3. **`imports.test.js`** - require, alias, import statements
4. **`use-statements.test.js`** - use statements with options and module references
5. **`strings.test.js`** - All string types (single, double, triple-quoted)
6. **`lists.test.js`** - Lists, atoms, module references in lists
7. **`identifiers.test.js`** - Identifiers, module names, predicates
8. **`ash-blocks.test.js`** - DSL blocks (postgres, actions, attributes, etc.)
9. **`literals.test.js`** - Numbers, booleans, basic literals
10. **`integration.test.js`** - Complete real-world Ash resources

#### Running Tests

```bash
# Run the complete test suite
npm run test:parser

# Run with verbose output for debugging
npx mocha test/parser.test.js --reporter spec
```

#### Test Coverage Strategy

- **Positive Testing**: Each feature has multiple test cases ensuring it parses correctly
- **Negative Testing**: Invalid syntax is tested to ensure it fails appropriately
- **Integration Testing**: Complete Ash resources test feature combinations
- **Regression Testing**: Failed cases become test cases to prevent regressions

#### Adding New Tests

When adding new grammar features:

1. **Create tests first** (TDD approach) in the appropriate test file
2. **Run tests** to confirm they fail as expected
3. **Implement grammar changes** to make tests pass
4. **Run full suite** to ensure no regressions
5. **Update this documentation** with new capabilities

#### Example Test Pattern

```javascript
describe("New Feature", function () {
  it("should parse basic case", function () {
    assertParses("new_syntax example", "Basic new syntax");
  });

  it("should handle complex case", function () {
    assertParses(
      `
      defmodule Example do
        new_syntax with: :options
      end
    `,
      "Complex new syntax in module"
    );
  });

  it("should reject invalid syntax", function () {
    assertDoesNotParse("invalid new_syntax", "Invalid syntax should fail");
  });
});
```

### Test Benefits

- **Confidence**: Extensive test coverage provides confidence when making changes
- **Regression Prevention**: Comprehensive suite catches breaking changes early
- **Documentation**: Tests serve as executable documentation of supported syntax
- **Development Speed**: TDD approach speeds up feature development
- **Quality Assurance**: Both positive and negative testing ensures robust parsing

## Grammar Files

- `ashGrammar.ne` - Source Nearley grammar
- `ashGrammar.js` - Compiled JavaScript parser
- `test/` - Comprehensive Mocha test suite (10 test files)
