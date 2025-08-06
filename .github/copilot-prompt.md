# Copilot Prompt for ash-studio-vscode-extension

## Quick Reference

- Use modular, interface-driven architecture.
- Pure logic modules must not depend on VS Code APIs.
- Centralize types/interfaces in [types](http://_vscodecontentref_/2).
- Document all public APIs with JSDoc.
- Prefer pipeline-style array processing.
- Run `npm test` and fix all errors after each change.
- Check off items when performing tasks from a checklist

## Architecture

- Main entry: [extension.ts](http://_vscodecontentref_/3)
- Sidebar: [sidebarProvider.ts](http://_vscodecontentref_/4)
- Parsing: [parser](http://_vscodecontentref_/5)
- Types: [types](http://_vscodecontentref_/6)

## Coding Conventions

- Use explicit fields in config/data structures.
- Avoid deeply nested loops; use array pipelines.
- Separate VS Code integration from pure logic.

## See Also

- CONTRIBUTING.md
- copilot-instructions.md
