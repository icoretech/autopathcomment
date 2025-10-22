# Style and Conventions

- Language: TypeScript.
- Linting: ESLint 9 with @typescript-eslint 8; project policy is zero warnings (lint runs with `--max-warnings=0`).
- ESLint rules emphasized: `curly`, `eqeqeq`, `no-throw-literal`, `semi` (project-level severities may be `warn` but CI enforces zero warnings).
- Code style: 2-space indent; keep lines focused and readable.
- Exports: Prefer named exports; avoid default exports.
- Functions: Small and pure where possible; explicit types where helpful.
- Commit messages: Conventional Commits required; e.g., `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. Include `BREAKING CHANGE:` in body for majors. Dependabot PRs use `fix(deps): bump ...` to trigger patch releases.
- Release Please: Relies on Conventional Commits to drive version and CHANGELOG.
