# Ash Studio VS Code Extension

A VS Code extension that enhances development experience for the Ash Framework (Elixir) with
navigation tools.

## 🚀 Features

- **🧭 Section Navigation** - Document symbol provider for Ash Resource/Domain files with tree
  structure in Outline
- **⚡ Quick Pick Navigation** - Fast searchable navigation to Ash sections in current file
- **📊 Custom Sidebar** - Dedicated Ash navigation panel showing all sections and hierarchy

## 📋 Development

- **🔧 Hybrid Parser Architecture** - Robust parsing with grammar-based primary parser and
  regex-based fallback
- **📝 Professional Logging** - Centralized structured logging with VS Code output channel
  integration

### **Getting Started**

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

### **Quality Pipeline**

```bash
# Run full quality check
npm run quality

# Auto-fix code quality issues
npm run quality:fix

# Individual quality checks
npm run type-check    # TypeScript validation
npm run lint         # ESLint code quality
npm run format:check # Prettier formatting
```

### **Testing**

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:parsers  # All parser tests
npm run test:grammar  # Grammar parser only
npm run test:simple   # Simple parser only
npm run test:hybrid   # Hybrid architecture only
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Core architecture and design principles
- **[Feature Plan](./docs/feature-plan.md)** - User-facing feature roadmap
- **[Senior Dev Review](./docs/SENIOR_DEV_ARCHITECTURE_REVIEW.md)** - Enterprise architecture
  improvements
- **[Complete Documentation Index](./docs/README.md)** - Full documentation overview

## 🏗️ Architecture

The extension uses a **hybrid parser strategy**:

- **Primary Parser**: Nearley grammar-based parser for comprehensive AST analysis
- **Fallback Parser**: Simple regex-based parser for reliability and performance
- **Strategy**: Always attempt grammar parser first, fallback to simple parser on errors
- **Benefit**: Ensures extension never completely breaks on malformed code

## 🎯 Quality Standards

This project maintains enterprise-grade quality:

- ✅ **TypeScript Strict Mode** - Type safety and compile-time error detection
- ✅ **ESLint + Prettier** - Code quality and consistent formatting
- ✅ **68 Comprehensive Tests** - Grammar, simple, and hybrid parser coverage
- ✅ **Centralized Logging** - Structured logging with configurable levels
- ✅ **Performance Monitoring** - Built-in metrics and performance tracking

## 🛠️ Technology Stack

- **Language**: TypeScript with strict mode
- **Parser**: Nearley grammar parser + regex fallback
- **Testing**: Mocha with organized test structure
- **Quality**: ESLint, Prettier, TypeScript compiler
- **Build**: TypeScript compiler with asset copying
- **VS Code API**: Full extension API integration

## 📈 Project Status

- **Parser Architecture**: ✅ Complete (Hybrid strategy implemented)
- **Quality Pipeline**: ✅ Complete (ESLint, Prettier, TypeScript)
- **Test Organization**: ✅ Complete (68 tests in organized structure)
- **Logging System**: ✅ Complete (Centralized with VS Code integration)
- **Documentation**: ✅ Complete (Comprehensive docs in `/docs` folder)

## 🤝 Contributing

1. Review the [Architecture Guide](./docs/ARCHITECTURE.md)
2. Check the [Feature Plan](./docs/feature-plan.md) for available work
3. Follow the quality pipeline: `npm run quality` before committing
4. Maintain test coverage: add tests for new features
5. Update documentation for architectural changes

---
