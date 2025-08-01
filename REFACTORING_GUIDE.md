# Refactoring & Interface Extraction Guide

## Registry & Singleton Patterns

**Preference:** Use class-based registries (e.g., `ConfigurationRegistry` with a singleton export
like `configurationRegistry`) instead of plain exported functions for shared registries or
service-like modules.

- **Rationale:**
  1. Aligns with common patterns in C# and Elixir, making the codebase more familiar to developers
     from those backgrounds.
  2. Allows for easier mocking and testability (e.g., swapping out the registry with a mock
     implementation in tests).
  3. Supports future extensibility (e.g., adding state, caching, or alternate strategies).

**Checklist:**

- When creating or refactoring a registry/service:
  - Define a class with clear public methods (e.g., `getAll()`, `register()`, etc.).
  - Export a singleton instance (e.g.,
    `export const configurationRegistry = new ConfigurationRegistry();`).
  - Update all consumers to use the singleton instance.
  - For tests, consider allowing injection or replacement of the singleton for mocking.

---

## How to Refactor: Modularization & Interface Extraction Checklist

1. **Inventory and Categorize**
   - List all files and their main responsibilities.
   - Identify modules that mix VS Code integration and pure logic.

2. **Extract and Centralize Types/Interfaces**
   - Move shared interfaces/types (e.g., ParsedDetail, ParsedSection, CodeLensEntry) to
     `src/types/ash.ts` or similar.
   - Update all imports to use the centralized types.

3. **Separate Pure Logic from VS Code Integration**
   - Refactor so that parsing, data modeling, and utilities do not import VS Code APIs.
   - Move VS Code-dependent code (providers, commands, UI) into a dedicated directory (e.g.,
     `src/features/`).

4. **Define Public vs Private APIs**
   - Use `export` only for public interfaces and functions.
   - Mark helpers/internal functions as `private` or leave unexported.

5. **Document Module Boundaries**
   - Add module-level comments describing the public API and intended usage.

6. **Update Tests**
   - Ensure tests import only public APIs.
   - Add/expand unit tests for pure logic modules.

7. **Update Documentation**
   - Revise this file and `feature-plan.md` to reflect the new structure and conventions.

8. **Build & Test**
   - Run all tests with `npm test` after any code change (no need to run `npm run build`
     separately).
   - Fix any errors or warnings before proceeding.

---

## Per-Type/Interface Extraction Checklist

For each interface/type to extract (e.g., ParsedDetail, ParsedSection, CodeLensEntry, ParseResult,
Parser):

1. Identify all usages across the codebase.
2. Move the interface/type definition to `src/types/ash.ts` (or appropriate shared types file).
3. Update all imports to use the new location.
4. Ensure the interface/type is exported only from the shared types module.
5. Remove duplicate or outdated definitions from other files.
6. Add/expand tests to cover logic using this type/interface.
7. Document the interface/type in the shared types file.

---
