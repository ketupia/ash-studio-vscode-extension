# Copilot Instructions for ash-studio VS Code Extension

## Project Overview

- This is a VS Code extension to enhance development for the Ash Framework (Elixir).
- Main features: Ash section navigation, Quick Pick, custom sidebar with section details, and
  (planned) CodeLens, hover, diagnostics, and code actions.
- All TypeScript source files are in `src/`. Build output is in `dist/`.
- Key files:
  - `src/extension.ts` (activation, registration, wiring)
  - `src/ashSidebarProvider.ts` (sidebar logic)
  - `src/ashQuickPick.ts` (Quick Pick navigation)
  - `src/ashSectionNavigation.ts` (DocumentSymbolProvider)
  - `src/ashSectionUtils.ts` (top-level block extraction)
  - `src/ashSectionDetailUtils.ts` (section detail parsing)
  - `feature-plan.md` (feature roadmap)
  - `package.json` (contributions, commands, sidebar registration)

## Architecture & Patterns

- **Section Navigation:**
  - Top-level Ash blocks are detected using `getTopLevelAshBlocks` (`ashSectionUtils.ts`).
  - Section details are parsed with `findAshSectionDetails` (`ashSectionDetailUtils.ts`).
    - Note: The parser identifies Elixir function definitions, so the pattern is more accurately
      `<function> <arg1>, <optional args> do ...` rather than `<type> <name> ...`.
  - Sidebar (`AshSidebarProvider`) shows both sections and section details, grouped by type and
    name.
- **Commands:**
  - `ash-studio.gotoSection`: Quick Pick navigation to top-level Ash blocks.
  - `ash-studio.revealSectionOrDetail`: Sidebar navigation to any block or section detail.
- **Language Support:**
  - Custom Elixir language configuration in `elixir.language-configuration.json` ensures `.ex` files
    are recognized for symbol providers.
- **Feature Tracking:**
  - `feature-plan.md` documents completed and planned features. Check here for project priorities
    and conventions.

## Developer Workflows

- **Build:** `npm test` (TypeScript, outputs to `dist/`)
- **Debug:** Use VS Code's extension debugging tools. Reload window after build changes.
- **Sidebar Registration:**
  - Sidebar view is registered in `package.json` under `contributes.views.explorer` with id
    `ashSidebar`.
  - The extension registers the TreeDataProvider with the same id in `extension.ts`.

## Project Conventions

- All new features should be implemented as separate modules in `src/` and imported in
  `extension.ts`.
- Only `dist/extension.js` should be referenced as the extension entry point.

## Integration Points

- No external APIs or services; all logic is local to the extension.
- Relies on VS Code extension API and Elixir language configuration.

## Examples

- See `src/ashSidebarProvider.ts` for sidebar logic and section detail display.
- See `src/ashSectionUtils.ts` and `src/ashSectionDetailUtils.ts` for block and section detail
  parsing.
- See `feature-plan.md` for current and planned features.

## AI Coding Preferences

- **Prefer declarative approaches over inferred/heuristic logic.**
  - For example, always use explicit fields (like a `command` property) in configuration and data
    structures, rather than inferring intent from names, titles, or other heuristics.
  - This ensures maintainability, clarity, and reduces ambiguity for both humans and AI agents.

- **Design semantic APIs and service interfaces.**
  - Method names and parameters should express the caller's intent, not implementation details.
  - For example, use `getBlockStartLineNumber()` and `getBlockEndLineNumber()` instead of
    `getLineNumber()` and `getLineNumberFromRegexMatch()`.
  - The caller should not need to understand internal implementation quirks (like regex match
    positions including newlines) to use the API correctly.
  - Service boundaries should be based on domain concepts, not technical implementation details.
  - Function signatures should make the purpose and usage clear without requiring knowledge of
    internal algorithms or data structures.

## Modularization & Interface-Driven Architecture

- All logic should be organized into small, well-defined modules with clear responsibilities.
- Public APIs must be defined using TypeScript interfaces and types, placed in a shared `types/` or
  `interfaces/` directory.
- Pure logic (e.g., parsing, data models) must not depend on VS Code APIs.
- VS Code integration (providers, commands, UI) should be isolated in dedicated modules.
- All modules should explicitly export only their public API; helpers and internals should remain
  private.
- When adding new features, first define the interface and types, then implement the logic.

## Commenting and Documentation Guidance

- **Prefer comprehensive source code documentation over separate markdown files.**
  - Write detailed JSDoc comments for all public classes, methods, and interfaces.
  - Focus on explaining WHAT the code does and HOW it works in its current state.
  - Document the purpose, responsibilities, and behavior of each component.
  - Include architectural patterns and design decisions that are currently in use.
  - Document complex algorithms, business logic, and non-obvious implementation details inline.

- **Source code should be self-documenting:**
  - Comments should explain the "what" and "how" of current functionality.
  - Include examples of usage in JSDoc when helpful.
  - Document parameters, return types, and thrown exceptions thoroughly.
  - Add comments explaining any non-trivial regex patterns, algorithms, or workarounds.
  - Reference related methods/classes in comments when there are important relationships.
  - Explain the architecture and responsibilities of each service/class.

- **Avoid redundant external documentation:**
  - Don't create separate markdown files that duplicate information better captured in code
    comments.
  - Keep README files focused on setup, overview, and getting started.
  - Use inline documentation for implementation details, API usage, and architectural notes.

- **Maintenance guidelines for comments:**
  - Do not leave comments about obsolete or deprecated functionality in the codebase.
  - Avoid lengthy refactoring history or "before/after" comparisons in comments.
  - Always update or rewrite comments to reflect the current, intended functionality and usage.
  - Remove files that are no longer needed, rather than leaving placeholders or deprecation notes.
  - Documentation and comments should help future maintainers understand the present state and
    current architecture.

## Build & Test After Each Change

- After making any code change (especially refactors or type/interface moves), always:
  1. Run a full build (`npm test`).
  2. Run all available tests.
  3. Fix any errors or warnings before proceeding.
- Do not consider a refactor or feature complete until the build and tests pass.
- When a test fails and the cause is unclear, ask for clarification. Sometimes the source is wrong,
  sometimes the test is wrong—ask for help to determine which.

## General Development Guidelines

- **Use Class-Based Registries and Singletons:**  
  For shared registries or service-like modules, define a class with clear public methods and export
  a singleton instance. This approach improves testability, extensibility, and aligns with familiar
  patterns from C# and Elixir.

- **Centralize Shared Types and Interfaces:**  
  Move all shared interfaces and types to a dedicated types file (e.g., `src/types/ash.ts`). Update
  all imports to use these centralized definitions, and ensure only the shared types module exports
  them.

- **Separate Pure Logic from VS Code Integration:**  
  Keep parsing, data modeling, and utility logic free of VS Code API dependencies. Place all VS
  Code-dependent code (such as providers, commands, and UI) in a dedicated directory (e.g.,
  `src/features/`).

- **Define Clear Public and Private APIs:**  
  Only export public interfaces and functions. Mark helpers and internal functions as private or
  leave them unexported.

- **Document Module Boundaries and APIs:**  
  Add module-level comments describing the public API and intended usage for each module.

- **Maintain and Expand Tests:**  
  Ensure tests import only public APIs. Add or expand unit tests for pure logic modules, especially
  when extracting or refactoring types and interfaces.

- **Keep Documentation Up to Date:**  
  Revise documentation files to reflect the current structure and conventions after any significant
  change.

- **Build and Test After Every Change:**  
  Run all tests (`npm test`) after any code change. Fix all errors and warnings before proceeding.
