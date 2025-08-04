# Changelog

## [0.0.8] - 2025-08-04

### Features

- feat: enhance navigation with cross-reference code lenses
  ([#32](https://github.com/ketupia/ash-studio-vscode-extension/pull/32))
  - Adds cross-reference code lenses for improved navigation between code interfaces and actions.
- feat: add AshJsonApi configuration and update tests
  ([#31](https://github.com/ketupia/ash-studio-vscode-extension/pull/31))
- feat: add GraphQL configuration and update registry and tests
  ([#30](https://github.com/ketupia/ash-studio-vscode-extension/pull/30))

### Fixes

- fix: ensure mix command spawns with shell:true on Windows for cross-platform compatibility
  ([#27](https://github.com/ketupia/ash-studio-vscode-extension/pull/27))
  - Ensures diagram generation works on Windows by spawning `mix` with `{ shell: true }`.
