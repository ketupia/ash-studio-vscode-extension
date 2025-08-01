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

---

If you add new features or patterns, update this file and `feature-plan.md` to keep AI agents
productive.
