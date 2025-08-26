# Copilot Instructions for ash-studio VS Code Extension

## Project Purpose

This extension enhances VS Code for Ash Framework (Elixir) development. It provides:

- Section navigation (Quick Pick, breadcrumbs)
- Custom sidebar with grouped section details
- CodeLens for diagrams
- Definition provider

## Key Architecture

- **Modular Design:**
  - All features are implemented as independent modules in `src/`, imported in `extension.ts`.
  - Pure logic (parsing, data models) is isolated from VS Code APIs.
  - VS Code integration (providers, commands, UI) is in dedicated modules.

- **Types & Interfaces:**
  - Types and interfaces live under `src/types/` (for example: `configurationRegistry.ts`,
    `extensionConfiguration.ts`). Update this note if you add a central types file.
  - Modules export only their public API; helpers/internals remain private.

- **Section Navigation:**
  - Top-level blocks: `getTopLevelSections` (pure logic)
  - Section details: `findSectionDetails` (pure logic)
  - Sidebar: `AshSidebarProvider` (VS Code integration)
  - Quick Pick: `ashQuickPick` (VS Code integration)

- **CodeLens for Diagrams:**
  - Implemented in `diagramCodeLensService.ts` and registered in
    `src/vscode/providers/codeLensProvider.ts`.

- **Definition Provider:**
  - Implemented in `definitionProvider.ts` and registered in
    `src/vscode/providers/registerDefinitionProvider.ts`.

- **Commands:**
  - `ash-studio.gotoSection`: Quick Pick navigation
  - `ash-studio.revealSectionOrDetail`: Sidebar navigation

- **Language Support:**
  - Custom Elixir configuration in `elixir.language-configuration.json` ensures `.ex` files are
    recognized.

## Development Workflow

- **Build & Test:**
  - Run `npm run build`, then `npx knip`, and `npm test` after changes.
  - All logic modules must have/expand unit tests.
  - Fix all errors/warnings before proceeding.

- **Debug:**
  - Use VS Code extension debugging tools.
  - Reload window after build changes.

- **Sidebar Registration:**
  - Registered in `package.json` under `contributes.views.explorer` (id: `ashSidebar`)
  - TreeDataProvider registered in `extension.ts`

## Coding Conventions

- **Declarative APIs:**
  - Prefer explicit fields (e.g., `command` property) over inferred logic.
  - Method names and parameters should express intent, not implementation details.

- **Pipeline Processing:**
  - Use array pipelines (`filter`, `map`, etc.) with small, named helpers.
  - Avoid deeply nested loops; use early returns and guard clauses.

- **Documentation:**
  - Comprehensive JSDoc for all public classes, methods, interfaces.
  - Document module boundaries, responsibilities, and design decisions inline.
  - Keep README focused on setup/overview; remove obsolete comments/files.

## Feature Tracking

- See `feature-plan.md` for roadmap and priorities.
- All new features must follow modularization and interface-driven patterns.

## Release & Contribution

- Follow the release workflow in `RELEASE.md`.
- See `CONTRIBUTING.md` for detailed development guidelines and AI coding preferences.
