# Release Checklist Template

For each release, copy this checklist to a new file (e.g., `release_plan_vX.Y.Z.md`) in the project
root.

Refer to this file for the canonical release workflow and checklist template.

```
- [ ] Create and check out a release branch (`git checkout -b release/vX.Y.Z`)
- [ ] Build the project and run all tests (`npm test`)
- [ ] Update `CHANGELOG.md` (add a new section at the top for this release)
  - [ ] Organize changelog by release version (newest to oldest)
  - [ ] Only update the newest (topmost) section
  - [ ] Add a summary of all merged PRs since the last release
  - [ ] Include PR titles, numbers, and brief user-facing descriptions
  - [ ] Group changes by type (Features, Fixes, Refactors) if possible
- [ ] Review and approve the changelog
- [ ] Update the version number in `package.json` (semantic versioning, e.g., `X.Y.Z`)
- [ ] Commit all changes
- [ ] Push all changes
- [ ] Review, approve, and merge the pull request into the main branch (human)
- [ ] Create and push a new git tag (format: `vX.Y.Z`, matches `package.json`)

Check off each item as you complete them.
```
