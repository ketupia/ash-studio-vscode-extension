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

- **Build:** `npm run build` (TypeScript, outputs to `dist/`)
- **Test:** No formal test suite yet; manual testing via VS Code Extension Development Host.
- **Debug:** Use VS Code's extension debugging tools. Reload window after build changes.
- **Sidebar Registration:**
  - Sidebar view is registered in `package.json` under `contributes.views.explorer` with id
    `ashSidebar`.
  - The extension registers the TreeDataProvider with the same id in `extension.ts`.

## Project Conventions

- All new features should be implemented as separate modules in `src/` and imported in
  `extension.ts`.
- Only `dist/extension.js` should be referenced as the extension entry point.
- Keep `feature-plan.md` and this file up to date as features and patterns evolve.

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

- Do not leave comments about obsolete or deprecated functionality in the codebase.
- Always update or rewrite comments to reflect the current, intended functionality and usage.
- Remove files that are no longer needed, rather than leaving placeholders or deprecation notes.
- Documentation and comments should help future maintainers understand the present state, not the
  past.

## Build & Test After Each Change

- After making any code change (especially refactors or type/interface moves), always:
  1. Run a full build (`npm run build`).
  2. Run all available tests.
  3. Fix any errors or warnings before proceeding.
- Do not consider a refactor or feature complete until the build and tests pass.
- When a test fails and the cause is unclear, ask for clarification. Sometimes the source is wrong,
  sometimes the test is wrong—ask for help to determine which.
