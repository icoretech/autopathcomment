# AutoPathComment

**AutoPathComment** is a Visual Studio Code extension that automatically inserts a comment at the top of your file with its **relative path** when you save. This can be useful for quickly identifying a file’s location, especially in large or multi-root workspaces.

## Features

- **Auto-insertion of file path on Save**
  Whenever you save a file in your workspace, AutoPathComment detects its relative path from the workspace root and inserts that path as a comment at the top of the file.

- **Supports Popular Languages**
  The extension recognizes file extensions like .js, .ts, .py, .php, .java, .go, and more. It uses the appropriate comment syntax for each language (e.g., // for JavaScript, # for Python).

- **Shebang Detection**
  If a file has a shebang (e.g., #!/usr/bin/env python), the extension can optionally skip or insert the path comment *after* the shebang to avoid interfering with scripts.

- **No Duplicate Comments**
  The extension checks if the relative path comment is already present, so it doesn’t insert it again on subsequent saves.

## Requirements

- Visual Studio Code 1.100.0 or higher
- Node.js (for extension development, if building from source)

## Installation

1. **From the VS Code Marketplace** (recommended):
   - Search for "AutoPathComment" by publisher "icoretech" and install.

2. **From a VSIX file**:
   1. Download the `autopathcomment-0.0.1.vsix` file (created by `vsce package`).
   2. In VS Code, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) and select **Extensions: Install from VSIX...**.
   3. Select the downloaded `.vsix` file to install.

3. **From Source**:
   1. Clone the repository or download it.
   2. Run `npm install`.
   3. Run `npm run package` or `vsce package` to create a `.vsix`.
   4. Install the `.vsix` in VS Code as above.

## Releases & Publishing

This repo includes GitHub Actions to validate builds and publish releases:

- CI: `.github/workflows/ci.yml` runs on pushes and PRs to lint, typecheck, test, and build.
- Release: `.github/workflows/release.yml` runs on Git tags like `v0.0.4` and will:
  - build and package the extension (`.vsix`),
  - create a GitHub Release with the VSIX attached,
  - publish to VS Code Marketplace (if `VSCE_PAT` secret is set).

- Release Please: `.github/workflows/release-please.yml` manages versions and CHANGELOG automatically using conventional commits. It creates a release PR; when merged, a tag and GitHub Release are created, which triggers the Release workflow to build and publish.

### Setup for Marketplace Publishing

1. Create a Publisher on the VS Code Marketplace and ensure the `publisher` field in `package.json` matches it. The current value is `icoretech`.
2. Create a Personal Access Token (Classic) with Marketplace scope via `vsce` docs and add it as repository secret `VSCE_PAT`.
3. Optional: enable Release Please by following Conventional Commits (feat:, fix:, docs:, chore:, refactor:, etc.).

### Cutting a Release

Option A (automated): Merge the Release Please PR that it opens. It will tag and publish a GitHub Release; the Release workflow will build, attach the `.vsix`, and publish to Marketplace.

Option B (manual): Bump the version locally: `npm version x.y.z` and push the tag `vX.Y.Z`. The Release workflow will package and publish to Marketplace.

## Usage

1. Open a file within a folder or workspace in VS Code.
2. Edit and **Save** (`Ctrl+S` / `Cmd+S`).
   - AutoPathComment will detect the file’s relative path and insert a comment at the top if it isn’t already present.
3. That’s it! You should now see something like:

   ```python
   # src/utils/parser.py

   # (rest of your file)
   ```

   or

   ```typescript
   // src/components/MyComponent.ts

   // (rest of your file)
   ```

## Configuration

Right now, the extension offers limited customization. You can modify the code to:

- **Adjust Supported File Types** by editing the `commentSyntaxMap` in [extension.ts](./src/extension.ts).

## Known Issues / Limitations

- **Multi-root Workspaces**: If you use multiple workspace roots, the file path is determined relative to the first matching workspace folder. If you have nested or overlapping folders, the extension may not behave as expected.
- **Large Files**: The extension does not differentiate between text and binary files. If you open and save very large files, insertion still occurs (though typically with minimal overhead).
- **Shebang**: Currently, if a shebang (`#!...`) is detected, the extension *skips* inserting the comment. This is to avoid breaking executable scripts.

## Contributing

1. Fork and clone the repo.
2. Create a new branch for your feature or bugfix.
3. Open a pull request describing your changes.

## License

This project is licensed under the [MIT License](LICENSE).
