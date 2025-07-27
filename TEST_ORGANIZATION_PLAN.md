# Test Organization Best Practices

## Current Structure (❌ Not Ideal)

```
test/
├── parser.test.js              # Main parser runner
├── simple-parser.test.js       # Simple parser tests
├── hybrid-parser.test.js       # Hybrid architecture tests
├── basic-module.test.js        # Grammar parser tests
├── module-attributes.test.js   # Grammar parser tests
├── imports.test.js             # Grammar parser tests
├── strings.test.js             # Grammar parser tests
├── use-statements.test.js      # Grammar parser tests
├── identifiers.test.js         # Grammar parser tests
├── lists.test.js               # Grammar parser tests
├── literals.test.js            # Grammar parser tests
├── ash-blocks.test.js          # Grammar parser tests
├── integration.test.js         # Grammar parser tests
├── parser-helpers.js           # Shared helpers
├── index.ts                    # VS Code test runner
└── runTest.ts                  # VS Code test setup
```

## Recommended Structure (✅ Best Practice)

```
test/
├── unit/                       # Unit tests by feature
│   ├── parsers/               # All parser-related tests
│   │   ├── grammar/           # Nearley grammar parser tests
│   │   │   ├── basic-module.test.js
│   │   │   ├── module-attributes.test.js
│   │   │   ├── imports.test.js
│   │   │   ├── strings.test.js
│   │   │   ├── use-statements.test.js
│   │   │   ├── identifiers.test.js
│   │   │   ├── lists.test.js
│   │   │   ├── literals.test.js
│   │   │   ├── ash-blocks.test.js
│   │   │   └── integration.test.js
│   │   ├── simple/            # Simple parser tests
│   │   │   ├── simple-parser.test.js
│   │   │   └── fallback.test.js
│   │   ├── hybrid/            # Hybrid parser tests
│   │   │   ├── hybrid-parser.test.js
│   │   │   └── strategy.test.js
│   │   └── shared/            # Shared parser utilities
│   │       ├── parser-helpers.js
│   │       └── test-data.js
│   ├── features/              # Feature-specific tests
│   │   ├── sidebar.test.js
│   │   ├── quick-pick.test.js
│   │   └── navigation.test.js
│   └── utils/                 # Utility service tests
│       ├── logger.test.js
│       ├── config.test.js
│       ├── performance.test.js
│       └── error-handler.test.js
├── integration/               # Integration tests
│   ├── parser-integration.test.js
│   └── extension-integration.test.js
├── fixtures/                  # Test data files
│   ├── ash-resources/
│   │   ├── simple-resource.ex
│   │   ├── complex-resource.ex
│   │   └── malformed-resource.ex
│   └── ash-domains/
│       └── sample-domain.ex
├── helpers/                   # Test utilities
│   ├── mock-vscode.js
│   ├── test-runner.js
│   └── assertions.js
├── index.ts                   # VS Code test runner
└── runTest.ts                 # VS Code test setup
```

## Benefits of This Organization

### 1. **Clear Separation of Concerns**

- Parser tests are isolated and organized by type
- Feature tests are separate from parser tests
- Utility tests don't interfere with core functionality

### 2. **Easier Maintenance**

- Find tests quickly by domain area
- Add new parser types without cluttering
- Scale testing as extension grows

### 3. **Better Test Running**

- Run only parser tests: `npm run test:parsers`
- Run only feature tests: `npm run test:features`
- Run integration tests separately

### 4. **Professional Structure**

- Follows industry best practices
- Makes onboarding new developers easier
- Supports different testing strategies

## Implementation Strategy

### Phase 1: Create New Structure

1. Create the new directory structure
2. Move existing files to appropriate locations
3. Update import paths

### Phase 2: Update Test Runners

1. Create specialized test runners for different categories
2. Update package.json scripts
3. Ensure all tests still run

### Phase 3: Add Missing Test Categories

1. Add utility service tests (logger, config, etc.)
2. Add feature-specific tests (sidebar, navigation)
3. Add integration tests
