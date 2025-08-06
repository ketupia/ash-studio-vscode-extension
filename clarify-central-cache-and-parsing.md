# Refactoring Plan: Clarify Central Cache and Parsing

This checklist outlines the steps to refactor the Ash parser and cache architecture for clarity and
separation of concerns.

## Goals

- Rename `AshParserService` to `AshParsedDataProvider` to clarify its role as a cache/data provider.
- Move all parsing logic out of `AshParserService` into `moduleParser` and related pure parser
  modules.
- Ensure all consumers use the new provider and parser interfaces.
- Update documentation and comments to reflect new responsibilities and architecture.
- Build and test after each major change.

## Checklist

- [x] Rename `AshParserService.ts` to `AshParsedDataProvider.ts`.
  - [x] Run `npm test` to verify no regressions.
- [x] Refactor `AshParserService` class to `AshParsedDataProvider`.
  - [x] Run `npm test` to verify no regressions.
- [x] Remove direct parsing logic from `AshParsedDataProvider`; delegate parsing to `moduleParser`.
  - [x] Run `npm test` to verify no regressions.
- [x] Update all imports/usages of `AshParserService` to `AshParsedDataProvider` across the
      codebase.
  - [x] Run `npm test` to verify no regressions.
- [x] Ensure `AshParsedDataProvider` only manages cache, document versioning, and provides parsed
      data.
  - [x] Run `npm test` to verify no regressions.
- [x] Ensure all parsing is performed by `moduleParser` and related parser modules.
  - [x] Run `npm test` to verify no regressions.
- [x] Update JSDoc comments and documentation to reflect new architecture and responsibilities.
  - [x] Run `npm test` to verify no regressions.
- [x] Build and run all tests (`npm test`).
- [x] Fix any errors or warnings.
- [x] Review and update documentation as needed.
- [x] Update all feature modules (sidebar, Quick Pick, navigation, CodeLens, etc.) to leverage the
      centralized caching provided by `ParsedDataProvider`.
  - [x] Run `npm test` to verify no regressions.
- [x] Refactor feature modules to remove any redundant or local caching logic, ensuring all parsed
      data access goes through `ParsedDataProvider`.
  - [x] Run `npm test` to verify no regressions.

---

Check off each item as you complete them. This plan ensures a clean separation between parsing and
caching/data provision, improving maintainability and clarity.
