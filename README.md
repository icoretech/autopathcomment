# AutoPathComment

**AutoPathComment** is a Visual Studio Code extension that automatically inserts a comment at the top of your file with its **workspace-relative path** whenever you save. The path always lands immediately after any required shebangs or language directives so scripts keep working, while still giving you a quick breadcrumb to the file’s location.

## Features

- **Auto-insertion of file path on Save**
  Whenever you save, AutoPathComment detects the file’s workspace-relative path and inserts it as a top-of-file comment.

- **Supports Popular Languages**
  Ships with defaults for common extensions (.js, .ts, .py, .php, .java, .go, .rb, etc.) and uses the correct single-line comment token for each. You can extend or override this map in settings.

- **Directive-aware insertion**
  Shebangs, Ruby magic comments (`# frozen_string_literal`, `# encoding`), Python `coding` declarations, and PHP opening tags are detected automatically. The comment is inserted right after that preamble so executables keep their required header.

- **No Duplicate Comments**
  The extension checks the insertion location before writing anything, so repeated saves keep the file tidy.

## Requirements

- Visual Studio Code 1.105.0 or higher
- Node.js (for extension development, if building from source)

## Installation

1. **From a VSIX file** (current distribution):
   1. Download the latest `autopathcomment-<version>.vsix` from the Releases tab or build one locally with `npm run package`.
   2. In VS Code, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) and select **Extensions: Install from VSIX...**.
   3. Select the downloaded `.vsix` file to install.

2. **From Source**:
   1. Clone the repository or download it.
   2. Run `npm install`.
   3. Run `npm run package` or `vsce package` to create a `.vsix`.
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
- Keys are file extensions (include the dot), values are single-line comment prefixes.

Examples:

```jsonc
// settings.json
{
  "autopathcomment.commentSyntaxMap": {
    ".sh": "#",
    ".kt": "//",
    ".zig": "//"
  }
}
```

## Known Issues / Limitations

- **Multi-root Workspaces**: The file path is determined relative to the first workspace folder whose filesystem path prefixes the document. Nested or overlapping folders may require custom settings.
- **Binary / Generated Files**: The extension does not discriminate between text and non-text files. Exclude generated artifacts via VS Code settings if needed.
- **Comment Syntax**: Only single-line comment prefixes are supported. Add a custom mapping in settings if your language uses a different single-line token.

## Development

- Install dependencies: `npm install` (also configures the local `commit-msg` hook for Conventional Commits).
- Build once: `npm run compile`
- Continuous build: `npm run watch`
- Run tests (VS Code integration via `@vscode/test-cli`): `npm test`
- Full check (types + lint + tests): `npm run check`

## Contributing

1. Fork and clone the repo.
2. Run `npm install` (sets up commit hooks locally).
3. Create a new branch for your feature or bugfix.
4. Open a pull request describing your changes.

## License

This project is licensed under the [MIT License](LICENSE).
