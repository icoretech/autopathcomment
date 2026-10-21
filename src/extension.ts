import * as path from 'node:path';
import * as vscode from 'vscode';

const RUBY_FROZEN_STRING_LITERAL_REGEX =
  /^#.*\bfrozen_string_literal:\s*(?:true|false)\b/i;
const RUBY_ENCODING_REGEX = /^#.*(?:en)?coding\s*[:=]\s*[-\w.]+/i;
const PYTHON_ENCODING_REGEX = /^#.*coding[:=]\s*[-\w.]+/;

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument((event) => {
      event.waitUntil(Promise.resolve(getSaveEdits(event.document)));
    }),
  );
}

function getSaveEdits(document: vscode.TextDocument): vscode.TextEdit[] {
  const folder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!folder) {
    return [];
  }
  const extension = path.extname(document.fileName).toLowerCase();
  const syntax = getCommentSyntax(extension, document.uri);
  const relativePath = path
    .relative(folder.uri.fsPath, document.uri.fsPath)
    .split(path.sep)
    .join('/');
  if (!syntax || /[\r\n\u2028\u2029]/u.test(relativePath)) {
    return [];
  }
  const line = determineInsertionLine(document, extension);
  if (line < 0) {
    return [];
  }
  const comment = `${syntax} ${relativePath}`;
  if (extension === '.php' && comment.includes('?>')) {
    return [];
  }
  if (
    document.lineAt(0).text.trim() === comment ||
    (line < document.lineCount && document.lineAt(line).text.trim() === comment)
  ) {
    return [];
  }
  const eol = document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
  const atEnd = line === document.lineCount;
  const position = atEnd
    ? document.lineAt(document.lineCount - 1).range.end
    : new vscode.Position(line, 0);
  const bomOffset =
    line === 0 && document.lineAt(0).text.startsWith('\uFEFF') ? 1 : 0;
  return [
    vscode.TextEdit.insert(
      position.translate(0, bomOffset),
      `${atEnd ? eol : ''}${comment}${eol}${eol}`,
    ),
  ];
}

const DEFAULT_COMMENT_SYNTAX_MAP: Readonly<Record<string, string>> = {
  '.mjs': '//',
  '.cjs': '//',
  '.mts': '//',
  '.cts': '//',
  '.rs': '//',
  '.js': '//',
  '.jsx': '//',
  '.ts': '//',
  '.tsx': '//',
  '.py': '#',
  '.tf': '#',
  '.hcl': '#',
  '.java': '//',
  '.c': '//',
  '.cpp': '//',
  '.cc': '//',
  '.cxx': '//',
  '.h': '//',
  '.hpp': '//',
  '.cs': '//',
  '.rb': '#',
  '.go': '//',
  '.php': '//',
  '.kt': '//',
  '.kts': '//',
  '.swift': '//',
  '.dart': '//',
  '.sh': '#',
  '.bash': '#',
  '.yaml': '#',
  '.yml': '#',
  '.toml': '#',
  '.ex': '#',
  '.exs': '#',
  '.lua': '--',
  '.sql': '--',
};

export function getCommentSyntax(
  extension: string,
  resource?: vscode.Uri,
): string | null {
  const cfg = vscode.workspace.getConfiguration('autopathcomment', resource);
  const userMap = cfg.get<unknown>('commentSyntaxMap', {});
  const effective = { ...DEFAULT_COMMENT_SYNTAX_MAP, ...normalizeMap(userMap) };
  return effective[extension.toLowerCase()] || null;
}

function normalizeMap(map: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof map !== 'object' || map === null || Array.isArray(map)) {
    return result;
  }
  for (const [key, value] of Object.entries(map)) {
    if (
      key &&
      typeof value === 'string' &&
      value.trim() &&
      !/[\r\n\u2028\u2029]/u.test(value)
    ) {
      result[(key.startsWith('.') ? key : `.${key}`).toLowerCase()] =
        value.trim();
    }
  }
  return result;
}

export function determineInsertionLine(
  document: vscode.TextDocument,
  fileExtension: string,
): number {
  const extension = fileExtension.toLowerCase();
  let index = document.lineAt(0).text.trim().startsWith('#!') ? 1 : 0;
  if (
    extension === '.swift' &&
    /^\/\/\s*swift-tools-version:/.test(document.lineAt(0).text.trim())
  ) {
    index = 1;
  }
  if (extension === '.php') {
    while (index < document.lineCount && !document.lineAt(index).text.trim()) {
      index++;
    }
    return index < document.lineCount &&
      isPhpOpeningTag(document.lineAt(index).text)
      ? index + 1
      : -1;
  }
  // A Python encoding declaration can follow an ordinary comment on line two.
  if (
    extension === '.py' &&
    document.lineCount > 1 &&
    /^\s*(?:#|$)/.test(document.lineAt(0).text) &&
    isPythonEncodingComment(document.lineAt(1).text)
  ) {
    index = 2;
  }
  for (; index < document.lineCount; index++) {
    const text = document.lineAt(index).text.trim();
    if (
      extension === '.rb' &&
      (isRubyFrozenStringLiteralLine(text) || isRubyEncodingComment(text))
    ) {
      continue;
    }
    if (extension === '.py' && isPythonEncodingComment(text)) {
      continue;
    }
    return index;
  }
  return index;
}

export function isRubyFrozenStringLiteralLine(line: string): boolean {
  return RUBY_FROZEN_STRING_LITERAL_REGEX.test(line.trim());
}

export function isRubyEncodingComment(line: string): boolean {
  return RUBY_ENCODING_REGEX.test(line.trim());
}

export function isPythonEncodingComment(line: string): boolean {
  return PYTHON_ENCODING_REGEX.test(line.trim());
}

export function isPhpOpeningTag(line: string): boolean {
  return /^<\?php\s*$/i.test(line.trim());
}

export function deactivate(): void {}
