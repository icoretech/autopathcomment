# Task Completion Checklist

- Run `npm run check-types` (TypeScript typecheck clean).
- Run `npm run lint` (must be zero warnings/errors).
- Run `npm test` and ensure all integration tests pass.
- Ensure commit message follows Conventional Commits (subject ≤ 72 chars; scope optional; no stray escapes like `\n`).
- If the change warrants a release, let Release Please open its PR; do not tag manually.
- Verify CI (GitHub Actions) green.
- For release PRs: skim CHANGELOG/versions, then merge when satisfied.
