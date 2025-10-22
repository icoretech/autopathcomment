# Suggested Commands

Development
- `npm run watch` – parallel watch: esbuild and `tsc --noEmit`.
- `npm run compile` – typecheck, lint (zero warnings), build dev bundle.
- `npm run package` – production build for releases.

Quality
- `npm run check-types` – `tsc --noEmit`.
- `npm run lint` – `eslint src --max-warnings=0`.
- `npm test` – run VS Code tests via `@vscode/test-cli`.
- `npm run check` – typecheck + lint + tests.

VSIX
- `npx @vscode/vsce package` – create `.vsix` locally.
- `npx @vscode/vsce publish` – publish (requires `VSCE_PAT`).

Git/Release
- Normal flow: push Conventional Commits → Release Please PR → merge → tag + release automation.
- Manual fallback: `npm version <patch|minor|major> && git push --follow-tags` (bypasses Release Please).
