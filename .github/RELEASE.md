# Release Checklist Template

For each release, copy this checklist to a new file (e.g., `release_plan_vX.Y.Z.md`) in the project
root.

Refer to this file for the canonical release workflow and checklist template.

```
- [ ] Create and check out a release branch (`git checkout -b release/vX.Y.Z`)
- [ ] Verify code quality
  - [ ] Copilot Code Review completed (human)
  - [ ] Project builds successfully
  - [ ] All tests pass (`npm test`)
  - [ ] No unused code detected (`npx knip`)
  - [ ] Comments are comprehensive and accurate (see CONTRIBUTING.md)
- [ ] Update `CHANGELOG.md` (add a new section at the top for this release)
  - [ ] Organize changelog by release version (newest to oldest)
  - [ ] Only update the newest (topmost) section
  - [ ] Add a summary of all merged PRs since the last release
  - [ ] Include PR titles, numbers, and brief user-facing descriptions
  - [ ] Group changes by type (Features, Fixes, Refactors) if possible
- [ ] Review and approve the changelog (human)
- [ ] Update the version number(`npm version patch`)
- [ ] Commit all changes
- [ ] Push all changes
- [ ] Create a pull request from the release branch to main
- [ ] Review, approve, and merge the pull request into the main branch (human)
- [ ] Create and push a new git tag (format: `vX.Y.Z`, matches `package.json`)

Check off each item as you complete them.
```
