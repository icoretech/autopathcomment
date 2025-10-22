# Release Flow

- Managed by Release Please (`.github/workflows/release-please.yml`).
- On pushes to `main`, Release Please updates/opens a PR (e.g., `chore(main): release 0.0.x`) with version bump + CHANGELOG.
- Merge the release PR → tag is created automatically (`vX.Y.Z` or `autopathcomment-vX.Y.Z`).
- Tag triggers `Release` workflow:
  - Build (`npm run package`) and package VSIX (`vsce package`).
  - Upload VSIX to GitHub Release (generate notes).
  - If `VSCE_PAT` secret is configured, `vsce publish` pushes to Marketplace.
- Manual fallback: `npm version <bump>` + `git push --follow-tags` triggers `Release` workflow but bypasses Release Please PR/CHANGELOG authoring.
