# AutoPathComment

**AutoPathComment** is a Visual Studio Code extension that automatically inserts a comment at the top of your file with its **workspace-relative path** whenever you save. The path always lands immediately after any required shebangs or language directives so scripts keep working, while still giving you a quick breadcrumb to the file’s location.

## Features

- **Auto-insertion of file path on Save**
  Whenever you save, AutoPathComment detects the file’s workspace-relative path and inserts it as a top-of-file comment.

- **Supports source files and configuration**
  Includes JavaScript and TypeScript module variants, C/C++ headers, Kotlin, Swift, Dart, shell scripts, YAML, TOML, Elixir, Lua, and SQL alongside the original languages. You can extend or override the map in settings.

- **Directive-aware insertion**
  Shebangs, Ruby magic comments (including editor-style encoding declarations), Python `coding` declarations, Swift tools-version headers, and standalone PHP opening tags are detected automatically. The comment is inserted after that preamble, including when the last directive has no trailing newline. CRLF line endings and UTF-8 BOMs are preserved.

- **No Duplicate Comments**
  The extension checks the insertion location before writing anything, so repeated saves keep the file tidy.

## Requirements

- Visual Studio Code 1.140.0 or higher
- For development: Node.js 24.15 or higher on the Node 24 release line, or Node.js 26 or higher, with npm 10 or higher

## Installation

1. **From a VSIX file** (current distribution):
   1. Download the latest `autopathcomment-<version>.vsix` from the Releases tab or build one locally with `npm run package`.
   2. In VS Code, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) and select **Extensions: Install from VSIX...**.
   3. Select the downloaded `.vsix` file to install.

2. **From Source**:
   1. Clone the repository or download it.
   2. Run `npm install`.
   3. Run `npm run vsce:package` to build and create a `.vsix`.
   4. Install the `.vsix` in VS Code as above.

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

You can customize the comment prefix per file extension via Settings:

- Setting: `autopathcomment.commentSyntaxMap`
- Keys are file extensions, values are single-line comment prefixes. Extensions are case-insensitive; a missing leading dot is accepted.
- Settings can be defined per workspace folder. The saved document's folder determines which override applies.

Examples:

```jsonc
// settings.json
{
  "autopathcomment.commentSyntaxMap": {
    ".zig": "//",
    ".r": "#",
    ".custom": "--"
  }
}
```

Built-in extensions:

| Prefix | Extensions |
| --- | --- |
| `//` | `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`, `.rs`, `.java`, `.c`, `.cpp`, `.cc`, `.cxx`, `.h`, `.hpp`, `.cs`, `.go`, `.php`, `.kt`, `.kts`, `.swift`, `.dart` |
| `#` | `.py`, `.rb`, `.tf`, `.hcl`, `.sh`, `.bash`, `.yaml`, `.yml`, `.toml`, `.ex`, `.exs` |
| `--` | `.lua`, `.sql` |

## Known Issues / Limitations

- **Workspace scope**: Paths use the innermost workspace folder, with `/` separators on every platform. Files outside the workspace are left unchanged.
- **PHP templates**: Only a standalone `<?php` opening line is supported. Inline PHP tags, short echo tags, and files without a full opening tag are left unchanged so comments cannot become rendered output. Paths or custom prefixes containing `?>` are also skipped for PHP.
- **Generated files**: Supported extensions are processed on save, including generated files. There is no generated-file exclusion setting.
- **Comment Syntax**: Only single-line comment prefixes are supported. Add a custom mapping in settings if your language uses a different single-line token.
- **Unusual names and settings**: Paths containing line breaks are skipped, and multiline custom prefixes are ignored, to prevent inserting executable text.
- **Renamed files**: An old path comment may remain after moving a file. Existing comments are never guessed at or rewritten.

## Development

- Install dependencies: `npm install` (also configures the local `commit-msg` hook for Conventional Commits).
- Build once: `npm run compile`
- Continuous build: `npm run watch`
- Run tests (VS Code integration via `@vscode/test-cli`): `npm test`
- Full check (types + lint + tests): `npm run check`
- Apply formatting and safe lint fixes: `npm run lint:fix`
- Package a distributable extension: `npm run vsce:package`

TypeScript 7 provides type checking and test compilation; Biome handles formatting and linting without relying on the removed TypeScript JavaScript API. `npm-run-all2` runs the development watchers. The test runner uses a disposable multi-root workspace and exercises actual document saves in VS Code. Set `VSCODE_VERSION` to test a specific supported release.

The Mocha override under `@vscode/test-cli` keeps the runner on Mocha 12 while its published dependency range still selects Mocha 11 with vulnerable transitive packages. Keep the real VS Code tests passing when updating or removing this override. The `allowScripts` entries approve the exact esbuild and VSIX-signing installation scripts for npm versions that require explicit approval.

## Releases

Release Please manages the version and changelog. Merging its release PR creates a tag and calls the publishing workflow directly; that workflow builds the VSIX, attaches it to the release, and publishes to the Marketplace when `VSCE_PAT` is configured. Manual release runs require the exact existing tag. Dependency updates use `deps:` commits and appear in a separate Dependencies changelog section.

## Contributing

1. Fork and clone the repo.
2. Run `npm install` (sets up commit hooks locally).
3. Create a new branch for your feature or bugfix.
4. Open a pull request describing your changes.

## License

This project is licensed under the [MIT License](LICENSE).
