# Changelog

## [0.1.3] - 2025-10-26

### Features

- feat: Show child entries in Symbols and Outline views
  ([#71](https://github.com/ketupia/ash-studio-vscode-extension/pull/71))
  - Adds the ability to include child DSL entries in the editor Outline and Symbols views. This
    improves navigation and visibility for nested Ash sections.

- perf: load libraries from CDN and rendering improvements
  ([#67](https://github.com/ketupia/ash-studio-vscode-extension/pull/67))

## [0.1.2] - 2025-08-26

### Features

#### Diagrams auto-deletion [#65](https://github.com/ketupia/ash-studio-vscode-extension/pull/65) and pan-zoom

- **breaking change**: diagramType removed - there was an option to specify what kind of diagram
  should be generated. (.mmd, .svg, .png, etc.)
- plain .mmd files: diagrams are now hardcoded to produce plain mermaid files that are read into the
  html template and then deleted
- auto-delete setting: controls if generated files are automatically deleted (the default).
- pan zoom controls: By default the image is fitted to the window. Added Svg Pan Zoom so that large
  diagrams could be seen.
- diagram window title: the diagram window title now reflects the source file and the diagram type

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
  - More children matched.

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
