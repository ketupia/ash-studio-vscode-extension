# Ash Studio Architecture Guide

## Overview

Ash Studio is a VS Code extension designed to enhance development experience for the Ash Framework (Elixir). This document outlines the architectural decisions, patterns, and best practices used throughout the codebase.

## Core Architecture Principles

### 1. **Hybrid Parser Strategy**

- **Primary Parser**: Nearley grammar-based parser for comprehensive AST analysis
- **Fallback Parser**: Simple regex-based parser for reliability and performance
- **Strategy**: Always attempt grammar parser first, fallback to simple parser on errors
- **Benefit**: Ensures extension never completely breaks on malformed code

### 2. **Centralized Services Pattern**

All major functionality is implemented as singleton services:

- `AshParserService`: Manages parsing with caching and fallback strategies
- `Logger`: Structured logging with configurable levels
- `ConfigurationManager`: Type-safe configuration access
- `PerformanceMonitor`: Performance metrics and monitoring
- `ErrorHandler`: Centralized error handling and recovery

### 3. **Reactive Architecture**

- Event-driven updates using VS Code's event system
- Debounced parsing to prevent excessive re-parsing
- Cache invalidation on document changes
- Automatic sidebar refresh on successful parsing

## Directory Structure

```
src/
├── extension.ts              # Extension entry point and activation
├── ashParserService.ts       # Centralized parser service with fallback
├── ashParser.ts              # Nearley grammar-based parser
├── simpleParser.ts           # Production-ready fallback parser
├── features/                 # Feature implementations
│   ├── ashSidebarProvider.ts # Sidebar tree view provider
│   ├── ashQuickPick.ts       # Quick navigation commands
│   └── ashSectionNavigation.ts # Document symbol provider
├── utils/                    # Shared utilities and services
│   ├── logger.ts             # Structured logging service
│   ├── config.ts             # Configuration management
│   ├── performance.ts        # Performance monitoring
│   └── errorHandler.ts       # Error handling and recovery
└── nearley/                  # Grammar parser implementation
    ├── ashGrammar.ne         # Nearley grammar definition
    └── ashGrammar.js         # Compiled grammar
```

## Key Design Patterns

### 1. **Singleton Services**

All services use the singleton pattern to ensure single instances:

```typescript
export class AshParserService {
  private static instance: AshParserService;

  static getInstance(): AshParserService {
    if (!AshParserService.instance) {
      AshParserService.instance = new AshParserService();
    }
    return AshParserService.instance;
  }
}
```

### 2. **Strategy Pattern for Parsing**

The parser service implements a strategy pattern for different parsing approaches:

- Hybrid strategy (default): Grammar parser → Simple parser fallback
- Grammar-only strategy: Only Nearley parser
- Simple-only strategy: Only regex parser

### 3. **Observer Pattern for Events**

Uses VS Code's event system and custom EventEmitters:

```typescript
private _onDidParse = new vscode.EventEmitter<AshParseResult>();
public readonly onDidParse = this._onDidParse.event;
```

### 4. **Decorator Pattern for Performance**

Performance monitoring uses decorators for clean instrumentation:

```typescript
@measurePerformance('parseDocument')
async parseDocument(document: vscode.TextDocument): Promise<AshParseResult> {
  // Implementation
}
```

## Configuration Management

### Type-Safe Configuration

All configuration is accessed through the `ConfigurationManager` with full TypeScript support:

```typescript
interface AshStudioConfig {
  logLevel: LogLevel;
  parserStrategy: "hybrid" | "grammar-only" | "simple-only";
  enablePerformanceMetrics: boolean;
  // ... more options
}
```

### User Settings

Configuration is exposed through VS Code settings with JSON schema:

- `ashStudio.logLevel`: Control logging verbosity
- `ashStudio.parserStrategy`: Choose parsing strategy
- `ashStudio.enablePerformanceMetrics`: Enable performance tracking
- `ashStudio.parseDebounceMs`: Control parsing frequency

## Error Handling Strategy

### Structured Error Handling

All errors are categorized and handled consistently:

```typescript
enum ErrorCategory {
  PARSING = "parsing",
  CONFIGURATION = "configuration",
  FILE_SYSTEM = "file-system",
  // ... more categories
}

enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
```

### Recovery Strategies

Each error type has defined recovery actions:

- **Parsing errors**: Fallback to simple parser
- **Configuration errors**: Reset to defaults
- **File system errors**: Retry once, then skip
- **Performance issues**: Reduce parsing frequency

### Safe Execution Wrappers

Operations that might fail are wrapped in safe execution:

```typescript
const result = await errorHandler.safeExecute(
  () => riskyOperation(),
  "ComponentName",
  ErrorCategory.PARSING,
  fallbackValue
);
```

## Performance Considerations

### 1. **Caching Strategy**

- Parse results are cached by document URI and version
- Cache is automatically invalidated on document changes
- Configurable cache size limits

### 2. **Debounced Operations**

- File change events are debounced (default: 300ms)
- Prevents excessive re-parsing during typing
- Configurable debounce timing

### 3. **Performance Monitoring**

- Optional performance metrics collection
- Tracks parse times, cache hit rates, error rates
- Automatic slow operation detection and logging

### 4. **Lazy Loading**

- Services are initialized only when needed
- Grammar compilation happens on first use
- Sidebar refreshes only when visible

## Testing Strategy

### Multi-Layer Testing

1. **Unit Tests**: Test individual parsers and utilities
2. **Integration Tests**: Test parser interactions and fallback behavior
3. **Performance Tests**: Verify parsing speed and memory usage
4. **Hybrid Tests**: Validate grammar parser vs simple parser consistency

### Test Organization

```
test/
├── parser.test.js           # Main test runner
├── simple-parser.test.js    # Simple parser unit tests
├── hybrid-parser.test.js    # Hybrid architecture tests
├── basic-module.test.js     # Grammar parser tests
└── parser-helpers.js        # Shared test utilities
```

## Extension Points for Future Development

### 1. **CodeLens Provider**

Framework ready for CodeLens implementation:

- Configuration option: `ashStudio.enableCodeLens`
- Placeholder in configuration schema
- Parser provides necessary position information

### 2. **Hover Information Provider**

Ready for hover tooltips:

- Configuration option: `ashStudio.enableHoverInfo`
- AST provides semantic information
- Error handling framework supports graceful failures

### 3. **Language Server Integration**

Architecture supports future LSP integration:

- Centralized parser service can be extended
- Error handling supports LSP error reporting
- Performance monitoring tracks LSP operations

### 4. **Diagnostic Provider**

Framework ready for linting/diagnostics:

- Error categorization supports diagnostic severity mapping
- Parser errors can be converted to VS Code diagnostics
- Configuration supports enabling/disabling features

## Development Workflow

### 1. **Build Process**

```bash
npm run build    # TypeScript compilation + grammar copying
npm test         # Run all tests
npm run lint     # Code quality checks
```

### 2. **Debug Process**

- Enable debug logging: Set `ashStudio.logLevel` to 3
- Check "Ash Studio" output channel for logs
- Use VS Code's extension debugging for breakpoints

### 3. **Performance Debugging**

- Enable performance metrics: Set `ashStudio.enablePerformanceMetrics` to true
- Monitor parse times in output logs
- Use `PerformanceMonitor.getPerformanceSummary()` for analysis

## Best Practices for Contributors

### 1. **Error Handling**

- Always use `ErrorHandler.safeExecute()` for operations that might fail
- Categorize errors appropriately
- Provide meaningful error messages with context

### 2. **Logging**

- Use the centralized `Logger` service
- Include component name in all log calls
- Use appropriate log levels (error, warn, info, debug)

### 3. **Configuration**

- Add new settings to `AshStudioConfig` interface
- Update package.json configuration schema
- Use `ConfigurationManager` for type-safe access

### 4. **Performance**

- Use `@measurePerformance` decorator for expensive operations
- Check performance impact with metrics enabled
- Consider caching strategies for repeated operations

### 5. **Testing**

- Add tests for both happy path and error cases
- Test fallback behavior for parsing failures
- Include performance tests for slow operations

## Migration Path from Current Codebase

1. **Phase 1**: Replace console.log with Logger service
2. **Phase 2**: Integrate ConfigurationManager for settings
3. **Phase 3**: Add ErrorHandler to existing error-prone operations
4. **Phase 4**: Enable PerformanceMonitor for optimization
5. **Phase 5**: Implement CodeLens and Hover providers

This architecture provides a solid foundation for current functionality while enabling future features and maintaining high code quality standards.
