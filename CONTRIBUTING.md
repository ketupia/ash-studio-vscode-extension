# Contributing to ash-studio VS Code Extension

Thank you for your interest in contributing! This project aims to enhance VS Code for Ash Framework
(Elixir) development. We welcome contributions of all kinds—features, bug fixes, documentation, and
tests.

For questions or help, open an [issue](https://github.com/ash-project/ash-studio-vscode-extension/issues) or start a [discussion](https://github.com/ash-project/ash-studio-vscode-extension/discussions).

Please be respectful and constructive in all interactions. We value a welcoming and inclusive community.

## Easiest Way to Contribute: Add a Module Configuration

The simplest and most impactful way to contribute is by providing a new **ModuleConfiguration** for
an Ash library. ModuleConfigurations enable the extension to recognize, parse, and display details
for new Ash modules in the sidebar, quick pick, and other features.

Review existing configuration files in `src/configurations/` for examples.

- For a minimal example of identifying a library's section, see
  [`AshGraphql.config.ts`](src/configurations/AshGraphql.config.ts).
- For a comprehensive example with every feature, see
  [`Ash.Resource.config.ts`](src/configurations/Ash.Resource.config.ts).

### Open an issue

1. Open an issue with your configuration in the text or as an attachment.
2. It would be super helpful if you could provide an example Elixir file using the configuration for
   testing.
   > ⚠️ **Note:** This is a public project! Be sure not to include secrets or proprietary code!

## Code Level contributions

For code contributions (features, bug fixes, etc.), please follow a typical pull request (PR)
workflow:

- Fork the repository and create a branch from `main`.
- Make your changes, add or update tests as needed.
- Submit a pull request with a clear description.
