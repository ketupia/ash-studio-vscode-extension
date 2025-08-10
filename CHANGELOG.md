# Changelog

## [0.1.1] - 2025-08-10

### Features

- feat: added AshOban configuration
  ([#56](https://github.com/ketupia/ash-studio-vscode-extension/pull/56))
  - Adds support for AshOban configuration module.

### Fixes

- fix: pass diagram source file to code lens ([#56])
  - Resolves missing source file issue for diagram CodeLens.
- fix: section content ranges were off by 1 ([#56])
  - Corrects section content range calculations.
- fix: improved child pattern parsing ([#56])
  - more children matched.

## [0.1.0] - 2025-08-08

### Features

- feat: add Definition Provider for Ash Framework sections
  ([#48](https://github.com/ketupia/ash-studio-vscode-extension/pull/48))
  - Enables Ctrl+Click (Go to Definition) for cross-referenced Ash sections and details in Elixir
    files.

### Removed

- remove: cross-reference CodeLens feature (replaced by Definition Provider for standard VS Code
  navigation)

### Fixes

- fix: child locations were incorrect.

### Refactors

- refactor: major refactoring for consistent naming
- refactor: essentially rewrote the parser adding more typescript interfaces to improve contracts

## [0.0.9] - 2025-08-05

### Features

- feat: add Jason, Outstanding, Neo4j configurations

### Refactors

- refactor: remove children from AshJason, AshOutstanding, and AshNeo4j configuration modules
  ([#40](https://github.com/ketupia/ash-studio-vscode-extension/pull/40))
  - Simplifies configuration structure by removing unnecessary children properties from these
    modules.

## [0.0.8] - 2025-08-04

- feat: enhance navigation with cross-reference code lenses
  ([#32](https://github.com/ketupia/ash-studio-vscode-extension/pull/32))
  - Adds cross-reference code lenses for improved navigation between code interfaces and actions.
- feat: add AshJsonApi configuration and update tests
  ([#31](https://github.com/ketupia/ash-studio-vscode-extension/pull/31))
  ([#30](https://github.com/ketupia/ash-studio-vscode-extension/pull/30))

  ([#27](https://github.com/ketupia/ash-studio-vscode-extension/pull/27))
  - Ensures diagram generation works on Windows by spawning `mix` with `{ shell: true }`.
