# Release Checklist Template

For each release, copy the checklist below to a new file (e.g., `release_plan_vX.Y.Z.md`) in the
project root.

# Release plan for vX.Y.Z

## Instructions:

### Task assignment

Tasks starting with:

- [bot] — Tasks for GitHub Copilot or other AI agents to perform automatically.
- [human] — Tasks that require manual review or approval by a human contributor.
- if neither, ai or the human can perform the task

### Workflow

[bot] Check off the items as you complete them.

## Branch Preparation

Goal: Establish a dedicated release branch to isolate and track changes for the upcoming release.

- [ ] Create and check out a release branch (`git checkout -b release/vX.Y.Z`) based on
      origin/main - Recommended workflow: - `git fetch origin` - `git checkout main` -
      `git pull origin main` - `git checkout -b release/vX.Y.Z` - If the release branch was created
      earlier, rebase onto the latest `origin/main` before generating changelog:
      `git fetch && git rebase origin/main`

## Ensure Code Quality

Goal: Verify that the codebase meets all quality standards and passes required checks before
release.

- [ ] Project builds successfully (`npm run build`). Note: `npm run build` runs the TypeScript
      compile and copies media/templates; it should complete without errors.
- [ ] Verify media assets (scripts/verify-media.js) — ensure embedded/packaged media files are
      present.
- [ ] No knip findings reported (`npx knip`) — run this after build to detect unused/unlisted
      dependencies.
- [ ] [human] Fix all knip findings before proceeding
- [ ] All tests pass (`npm test`) — tests will run build as part of their pipeline; run after
      build/knip verification.

## Public documentation

Goal: Ensure the changelog accurately summarizes all user-facing changes since the last release.

- [ ] Update `CHANGELOG.md`: Add a new section at the top for this release, organize changelog by
      release version (newest to oldest), only update the newest (topmost) section, add a summary of
      all merged PRs since the last release, include PR titles, numbers, and brief user-facing
      descriptions, and group changes by type (Features, Fixes, Refactors). - Quick command to
      collect merges since the previous tag (replace vX.Y.Z):
      `git log --merges --pretty=format:"%s (%h)" vX.Y.Z..origin/main`
- [ ] [human] Review and approve the changelog

## AI documentation

Goal: Confirm that all AI-related instructions and documentation are up-to-date and accurate.

- [ ] Review all AI instructions in the .github folder for accuracy and completeness

## Versioning

Goal: Update version numbers to reflect the new release and maintain proper version history.

- [ ] Commit all changes
- [ ] Run `npm version patch` (or `npm version x.y.z`) to update the version number (creates a
      commit and tag by default)
- [ ] Commit all changes (the only changes should be package.json and package-lock.json if using
      `npm version --no-git-tag-version`)

## Finalization

Goal: Complete all final steps to publish the release, merge changes, and tag the new version.

- [ ] Push all changes
- [ ] Push all changes
- [ ] Create a pull request from the release branch to main
- [ ] [human] Review, approve, and merge the pull request into the main branch
- [ ] Create and push a new git tag (prepend 'v' to the version in package.json, e.g. "vX.Y.Z")
- [ ] Confirm that the new release is marked as the latest release
- [ ] Run the workflows to publish to the extension stores
