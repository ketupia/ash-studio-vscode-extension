# Ash Studio VS Code Extension: Development Guide

## Overview

This guide consolidates all development practices, quality standards, and processes for the Ash
Studio VS Code extension. It serves as the single source of truth for maintaining code quality and
preventing last-minute issues.

## Project Structure

```
ash-studio-vscode-extension/
├── src/
│   ├── extension.ts              # Extension entry point and activation
│   ├── ashParserService.ts       # Ultra-safe parser service with fallback
│   ├── ashParser.ts              # Nearley grammar-based parser (strict types)
│   ├── simpleParser.ts           # Production-ready fallback parser
│   ├── features/                 # Feature implementations
│   │   ├── ashSidebarProvider.ts # Sidebar tree view provider
│   │   ├── ashQuickPick.ts       # Quick navigation commands
│   │   └── ashSectionNavigation.ts # Document symbol provider
│   ├── utils/                    # Shared utilities and services
│   │   ├── logger.ts             # Structured logging service
│   │   ├── config.ts             # Configuration management
│   │   ├── performance.ts        # Performance monitoring
│   │   └── errorHandler.ts       # Centralized error handling
│   └── nearley/                  # Grammar definitions
│       ├── ashGrammar.ne         # Nearley grammar source
│       └── ashGrammar.js         # Compiled grammar
├── examples/                     # Real-world Ash files for testing
├── docs/                         # Documentation
└── test/                         # Test suites
```

## Quality Standards & Best Practices

### TypeScript Standards

- **No `any` types**: Use `unknown` with type guards instead
- **Strict type checking**: All functions must have explicit return types
- **Null safety**: Always check for null/undefined before property access
- **Type guards**: Use proper type guards for `unknown` values
- **Error handling**: All catch blocks use `unknown` type with proper type checking

### Code Quality Standards

```typescript
// ✅ GOOD: Proper type safety
function parseNode(node: unknown): ParseResult {
  if (!isValidNode(node)) {
    return { error: "Invalid node type" };
  }
  // Type-safe operations...
}

// ❌ BAD: Using any
function parseNode(node: any): ParseResult {
  return node.whatever; // No type safety
}
```

### Error Handling Strategy

- **Ultra-safe parsing**: Multiple fallback layers prevent extension crashes
- **Graceful degradation**: Extension continues working even with parser failures
- **Comprehensive logging**: All errors logged with context for debugging
- **User-friendly messages**: Technical errors converted to actionable user messages

## Quality Checklist

### 🔴 **CRITICAL (Must Pass Before Any Commit)**

#### Code Quality

- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes with zero warnings
- [ ] All TypeScript strict mode checks pass
- [ ] No `any` types used (use `unknown` + type guards)
- [ ] All functions have explicit return types
- [ ] Error handling uses `unknown` type in catch blocks

#### Testing

- [ ] Extension activates successfully in development host
- [ ] No crashes when opening complex Ash files
- [ ] Sidebar displays correctly for valid Ash files
- [ ] Quick Pick navigation works for all section types
- [ ] Parser fallback works when grammar parser fails

#### Real-World Validation

- [ ] Test with `examples/resources/vaccine.ex` (known complex file)
- [ ] Test with files containing string interpolation `#{}`
- [ ] Test with files containing `expr()` expressions
- [ ] Test with multi-line conditional logic
- [ ] Test with large files (>1000 lines)

### 🟡 **IMPORTANT (Should Pass Before PR)**

#### Documentation

- [ ] Code changes documented in relevant files
- [ ] API changes reflected in architecture docs
- [ ] Breaking changes noted in changelog
- [ ] Examples updated if syntax changes

#### Performance

- [ ] No memory leaks in parser service
- [ ] Parse cache working correctly
- [ ] Debounced parsing prevents excessive re-parsing
- [ ] Extension startup time < 1 second

#### User Experience

- [ ] Error messages are user-friendly
- [ ] Loading states shown for long operations
- [ ] Sidebar refreshes automatically on file changes
- [ ] Commands available in command palette

### 🟢 **NICE TO HAVE (Continuous Improvement)**

#### Code Organization

- [ ] Services follow singleton pattern
- [ ] Feature modules are self-contained
- [ ] Utility functions are pure and testable
- [ ] Configuration is centralized and type-safe

#### Monitoring

- [ ] Performance metrics collected
- [ ] Error rates tracked
- [ ] User activity logged (anonymously)
- [ ] Debug information available for troubleshooting

## Development Workflow

### 1. Setup Quality Gates (Day 1)

```bash
# Install dependencies
npm install

# Verify quality checks pass
npm run quality
```

### 2. Development Process

1. **Start with types**: Define interfaces before implementation
2. **Write tests first**: Create test cases for complex scenarios
3. **Use real data**: Test with actual Ash files from examples/
4. **Incremental quality**: Run `npm run quality` frequently
5. **Defensive programming**: Assume all external data is invalid

### 3. Pre-Release Checklist

```bash
# Full quality validation
npm run quality        # Runs: type-check + lint + format-check + test

# Extension testing
code --extensionDevelopmentPath=. --new-window examples/

# Package and validate
npm run package       # Runs: quality + build + vsce package
```

## Developer Quick Start

```bash
# Clone the repository
git clone https://github.com/ketupia/ash-studio-vscode-extension.git
cd ash-studio-vscode-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Run tests
npm test
```

## Quality Pipeline

```bash
# Run full quality check (recommended)
npm run quality        # Runs: type-check + lint + format-check + test

# Individual quality checks
npm run type-check     # TypeScript validation
npm run lint          # ESLint code quality
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Auto-format with Prettier
npm run format:check  # Check Prettier formatting
```

## Testing Framework

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:parsers  # All parser tests
npm run test:grammar  # Grammar parser only
npm run test:simple   # Simple parser only
npm run test:hybrid   # Hybrid architecture only
```

## Technology Stack

- **Language**: TypeScript with strict mode
- **Parser**: Nearley grammar parser + regex fallback
- **Testing**: Mocha with organized test structure
- **Quality**: ESLint, Prettier, TypeScript compiler
- **Build**: TypeScript compiler with asset copying
- **VS Code API**: Full extension API integration

## Project Status

- **Parser Architecture**: ✅ Complete (Hybrid strategy implemented)
- **Quality Pipeline**: ✅ Complete (ESLint, Prettier, TypeScript)
- **Test Organization**: ✅ Complete (68 tests in organized structure)
- **Logging System**: ✅ Complete (Centralized with VS Code integration)
- **Documentation**: ✅ Complete (Comprehensive docs in `/docs` folder)
- **Circuit Breaker**: ✅ Complete (Ultra-safe parser with fallback strategies)

## Common Anti-Patterns to Avoid

### ❌ **Quality Debt Accumulation**

```typescript
// Don't do this - creates technical debt
function quickFix(data: any) {
  // "I'll fix the types later"
  return data.whatever; // No validation
}
```

### ❌ **Late Real-World Testing**

- Don't test only with simple examples
- Don't wait until packaging to test complex files
- Don't assume grammar parser works for all cases

### ❌ **Error Suppression**

```typescript
// Don't do this - hides problems
try {
  dangerousOperation();
} catch {
  // Silent failure - problems hidden
}
```

### ✅ **Quality-First Patterns**

```typescript
// Do this - type-safe and defensive
function robustParser(input: unknown): ParseResult {
  if (!isValidInput(input)) {
    logger.warn("Invalid input received", { input });
    return { success: false, error: "Invalid input" };
  }

  try {
    return parseWithFallback(input);
  } catch (error: unknown) {
    logger.error("Parse failed", { error });
    return { success: false, error: "Parse failed" };
  }
}
```

## Emergency Procedures

### Extension Crashes in Production

1. Check logs for error patterns
2. Identify problematic file types
3. Update ultra-safe parser detection patterns
4. Release hotfix with enhanced fallback logic

### Performance Issues

1. Check parser cache hit rates
2. Identify large files causing problems
3. Implement file size limits
4. Add progress indicators for long operations

### Type Safety Violations

1. Run full TypeScript strict check: `tsc --noEmit --strict`
2. Fix all `any` types immediately
3. Add comprehensive type guards
4. Update tests to cover new type constraints

## Lessons Learned

### What Went Wrong (2025-01 Release)

- **Late quality fixes**: Type issues discovered during packaging
- **Insufficient real-world testing**: Complex files caused crashes
- **Accumulated technical debt**: Multiple `any` types needed fixing

### Process Improvements

- **Quality gates from day 1**: Strict TypeScript + linting always enabled
- **Real-world test corpus**: Complex Ash files tested continuously
- **Incremental quality**: Fix issues immediately, don't defer
- **Defensive architecture**: Assume all inputs are potentially problematic

## Success Metrics

### Code Quality

- Zero TypeScript errors in strict mode
- Zero ESLint warnings
- 100% type safety (no `any` types)
- All functions have explicit return types

### Reliability

- Zero extension host crashes in testing
- Graceful degradation for all error cases
- Fast recovery from parser failures
- Consistent sidebar and navigation functionality

### Performance

- Extension activation < 1 second
- File parsing < 500ms for typical files
- Cache hit rate > 80% for repeated parses
- Memory usage stable over time

---

_This guide is a living document. Update it as we learn from each release cycle._
