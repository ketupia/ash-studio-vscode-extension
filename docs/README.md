# Ash Studio VS Code Extension Documentation

This folder contains comprehensive documentation for the Ash Studio VS Code Extension project.

## 📋 Documentation Index

### **For Users**

- [`../README.md`](../README.md) - Installation, usage, and troubleshooting guide

### **For Developers**

- [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) - Complete development setup, quality standards,
  and contribution guidelines

### **Architecture & Design**

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Core architecture guide and design principles
- [`feature-plan.md`](./feature-plan.md) - User-facing feature roadmap and completion status

## 🚀 Quick Navigation

**New to the project?** Start with:

1. [`../README.md`](../README.md) - User guide and installation
2. [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) - Developer setup

**Contributing?** Review:

1. [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) - Quality standards and workflow
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Technical architecture
3. [`feature-plan.md`](./feature-plan.md) - Available work and priorities

- [`LOGGING_COMPARISON.md`](./LOGGING_COMPARISON.md) - Before/after comparison of logging approaches
- [`TEST_ORGANIZATION_PLAN.md`](./TEST_ORGANIZATION_PLAN.md) - Test structure organization and best
  practices
- [`REORGANIZATION_SUMMARY.md`](./REORGANIZATION_SUMMARY.md) - Project reorganization summary

## 🎯 Quick Navigation

### **For Developers**

- Start with [`ARCHITECTURE.md`](./ARCHITECTURE.md) to understand the codebase structure
- Review [`SENIOR_DEV_ARCHITECTURE_REVIEW.md`](./SENIOR_DEV_ARCHITECTURE_REVIEW.md) for
  infrastructure improvements
- Check [`feature-plan.md`](./feature-plan.md) for what features are planned or completed

### **For Contributors**

- Read [`TEST_ORGANIZATION_PLAN.md`](./TEST_ORGANIZATION_PLAN.md) to understand the testing strategy
- See [`LOGGING_COMPARISON.md`](./LOGGING_COMPARISON.md) for logging best practices

### **For Project Management**

- Use [`feature-plan.md`](./feature-plan.md) for user-facing feature tracking
- Use [`SENIOR_DEV_ARCHITECTURE_REVIEW.md`](./SENIOR_DEV_ARCHITECTURE_REVIEW.md) for technical debt
  and infrastructure planning

## 🏗️ Architecture Overview

The Ash Studio extension uses a **hybrid parser architecture** with:

- **Primary**: Nearley grammar-based parser for comprehensive AST analysis
- **Fallback**: Simple regex-based parser for reliability
- **Services**: Centralized logging, configuration, performance monitoring, and error handling
- **Testing**: Organized unit/integration test structure with 68 comprehensive tests

## 🚀 Quality Standards

This project maintains enterprise-grade quality through:

- **TypeScript Strict Mode** - Type safety and compile-time error detection
- **ESLint + Prettier** - Code quality and consistent formatting
- **Comprehensive Testing** - 68 tests covering grammar, simple, and hybrid parser scenarios
- **Centralized Logging** - Structured logging with VS Code output channel integration
- **Performance Monitoring** - Built-in performance tracking and metrics collection

---

_This documentation is maintained alongside the codebase and reflects the current state of the
project._
