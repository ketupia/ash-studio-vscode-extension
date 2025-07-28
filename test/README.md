# Test Structure Documentation

## Reorganized Test Structure

The tests have been reorganized to match the source code structure for better maintainability and
clarity.

### Current Structure

```
test/
├── organized-parser.test.js                    # Main test loader
├── integration/
│   └── parser-service.test.js                  # AshParserService integration tests
└── unit/
    └── parsers/
        ├── configurationDriven/
        │   ├── findUseDeclarations.test.ts      # Use declaration parsing tests
        │   └── identifyConfiguredModules.test.ts # Module configuration tests
        ├── grammarBased/
        │   ├── ash-blocks.test.js               # Ash DSL block parsing
        │   ├── basic-module.test.js             # Basic module structure
        │   ├── identifiers.test.js              # Identifier parsing
        │   ├── imports.test.js                  # Import statement parsing
        │   ├── integration.test.js              # Grammar integration tests
        │   ├── lists.test.js                    # List parsing
        │   ├── literals.test.js                 # Literal value parsing
        │   ├── module-attributes.test.js        # Module attribute parsing
        │   ├── strings.test.js                  # String parsing
        │   └── use-statements.test.js           # Use statement parsing
        └── regexBased/
            └── simple-parser.test.js            # SimpleParser (fallback) tests
```

### Source Structure Mapping

This structure directly maps to the source code organization:

```
src/
├── ashParserService.ts                          # → test/integration/parser-service.test.js
└── parsers/
    ├── parser.ts                                # Unified interfaces (tested implicitly)
    ├── configurationDriven/                     # → test/unit/parsers/configurationDriven/
    │   ├── configurationDrivenParser.ts
    │   ├── moduleParser.ts
    │   └── moduleInterface.ts
    ├── grammarBased/                            # → test/unit/parsers/grammarBased/
    │   └── ashParser.ts
    └── regexBased/                              # → test/unit/parsers/regexBased/
        └── simpleParser.ts
```

### Test Categories

1. **Unit Tests** (`test/unit/parsers/`):
   - Test individual parser implementations
   - Test specific parsing functionality
   - Test error handling and edge cases

2. **Integration Tests** (`test/integration/`):
   - Test AshParserService coordination between parsers
   - Test parser selection strategy
   - Test caching and service-level functionality

### Key Updates Made

1. **Moved tests** to match source structure:
   - `test/dslConfigurations/` → `test/unit/parsers/configurationDriven/`
   - `test/unit/parsers/simple/` → `test/unit/parsers/regexBased/`
   - `test/unit/parsers/grammar/` → `test/unit/parsers/grammarBased/`
   - `test/unit/parsers/hybrid/` → `test/integration/` (renamed to reflect purpose)

2. **Updated import paths** to reflect new locations

3. **Modernized tests** to use unified parser interfaces:
   - SimpleParser class instead of `parseAshDocumentSimple` function
   - ParseResult interface instead of various legacy interfaces
   - AshParserService integration testing

4. **Improved test organization**:
   - Clear separation between unit and integration tests
   - Better naming to reflect actual functionality
   - Updated test loader (`organized-parser.test.js`)

### Running Tests

- **All tests**: `npx mocha test/organized-parser.test.js`
- **Specific parser**: `npx mocha test/unit/parsers/regexBased/simple-parser.test.js`
- **Integration only**: `npx mocha test/integration/parser-service.test.js`
- **Configuration tests**: `npx mocha test/unit/parsers/configurationDriven/*.test.ts`

### Benefits

1. **Maintainability**: Tests are located next to corresponding source code conceptually
2. **Clarity**: Test structure immediately shows what functionality is being tested
3. **Consistency**: Matches established patterns from other TypeScript projects
4. **Scalability**: Easy to add new parser tests in the appropriate subdirectory
