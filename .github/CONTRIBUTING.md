# Contributing Guidelines

## General Development Guidelines

- Use class-based registries and singletons for shared services.
- Centralize shared types and interfaces in `src/types/ash.ts`.
- Separate pure logic from VS Code integration.
- Define clear public and private APIs.
- Document module boundaries and APIs.
- Maintain and expand tests for pure logic modules.
- Keep documentation up to date after significant changes.
- Build and test after every change (`npm test`).

## Commenting and Documentation Guidance

- Prefer comprehensive source code documentation over separate markdown files.
- Write detailed JSDoc comments for all public classes, methods, and interfaces.
- Document the purpose, responsibilities, and behavior of each component.
- Include architectural patterns and design decisions in use.
- Document complex algorithms and non-obvious implementation details inline.
- Source code should be self-documenting; explain the "what" and "how" of current functionality.
- Avoid redundant external documentation and keep README focused on setup and overview.
- Remove obsolete comments and files; always update comments to reflect current functionality.

## AI Coding Preferences

- Prefer declarative approaches over inferred/heuristic logic.
  - For example, always use explicit fields (like a `command` property) in configuration and data
    structures, rather than inferring intent from names, titles, or other heuristics.
  - This ensures maintainability, clarity, and reduces ambiguity for both humans and AI agents.

- Design semantic APIs and service interfaces.
  - Method names and parameters should express the caller's intent, not implementation details.
  - For example, use `getBlockStartLineNumber()` and `getBlockEndLineNumber()` instead of
    `getLineNumber()` and `getLineNumberFromRegexMatch()`.
  - The caller should not need to understand internal implementation quirks (like regex match
    positions including newlines) to use the API correctly.
  - Service boundaries should be based on domain concepts, not technical implementation details.
  - Function signatures should make the purpose and usage clear without requiring knowledge of
    internal algorithms or data structures.

- Favor pipeline-style processing with helper functions.
  - When implementing logic that involves filtering, mapping, or transforming collections, prefer a
    pipeline of array methods (`filter`, `map`, `flatMap`, etc.) with small, well-named helper
    functions for each transformation step.
  - This style should resemble Elixir's `Enum` pipelines: break up complex logic into a series of
    focused, composable steps.
  - Avoid deeply nested loops or imperative code when a pipeline with helpers would be clearer.
  - Use early returns and guard clauses in helpers to keep each step focused and readable.
  - Example: Instead of a large nested loop, use chained array methods and extract the innermost
    logic into a named function.
