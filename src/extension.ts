// src/extension.ts

// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as path from 'path';

const RUBY_FROZEN_STRING_LITERAL_REGEX = /^#\s*frozen_string_literal:\s*(?:true|false)?\s*$/i;
const RUBY_ENCODING_REGEX = /^#\s*encoding:\s*[-\w.]+\s*$/i;
const PYTHON_ENCODING_REGEX = /^#.*coding[:=]\s*[-\w.]+.*$/i;
const PHP_OPEN_TAG_REGEX = /^<\?/i;

export function activate(context: vscode.ExtensionContext) {
    console.log('AutoPathComment extension is now active!');

    const willSaveListener = vscode.workspace.onWillSaveTextDocument(async (event) => {
        const document = event.document;

        // Ensure the document is part of a workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            // No workspace folder is open
            return;
        }

        // Find the workspace folder that contains this document
        const workspaceFolder = workspaceFolders.find(folder =>
            document.uri.fsPath.startsWith(folder.uri.fsPath)
        );
        if (!workspaceFolder) {
            return;
        }

        // Determine the relative path of the file
        const filePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);

        // Determine the appropriate comment syntax based on file extension
        const fileExtension = path.extname(document.fileName);
        const commentSyntax = getCommentSyntax(fileExtension);
        if (!commentSyntax) {
            // Unsupported file type
            return;
        }

        // We'll insert just "# relative/path.py" and a blank line below it
        const commentLine = `${commentSyntax} ${filePath}`;
        const commentToInsert = `${commentLine}\n\n`;

        // Check the first couple of lines
        const firstLine = document.lineAt(0).text;
        const trimmedFirstLine = firstLine.trim();

        // If the file already starts with that exact line, do nothing
        if (trimmedFirstLine === commentLine.trim()) {
            return;
        }

        // Use event.waitUntil(...) to apply the edit before the save finishes
        event.waitUntil((async () => {
            const edit = new vscode.WorkspaceEdit();

            const insertionLine = determineInsertionLine(document, fileExtension);
            const existingLine = insertionLine < document.lineCount ? document.lineAt(insertionLine).text.trim() : '';
            if (existingLine === commentLine.trim()) {
                return;
            }

            edit.insert(document.uri, new vscode.Position(insertionLine, 0), commentToInsert);

            await vscode.workspace.applyEdit(edit);
        })());
    });

    context.subscriptions.push(willSaveListener);
}

const DEFAULT_COMMENT_SYNTAX_MAP: Record<string, string> = {
    '.mjs': '//',
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
    '.cs': '//',
    '.rb': '#',
    '.go': '//',
    '.php': '//',
};

function getCommentSyntax(extension: string): string | null {
    // Read user overrides each time to reflect settings changes immediately.
    const cfg = vscode.workspace.getConfiguration('autopathcomment');
    const userMap = cfg.get<Record<string, string>>('commentSyntaxMap', {});
    const effective = { ...DEFAULT_COMMENT_SYNTAX_MAP, ...normalizeMap(userMap) } as Record<string, string>;
    return effective[extension] || null;
}

function normalizeMap(map: Record<string, string> | undefined): Record<string, string> {
    if (!map) {
        return {};
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(map)) {
        if (!k) {
            continue;
        }
        const key = k.startsWith('.') ? k : `.${k}`;
        if (typeof v === 'string' && v.trim().length > 0) {
            out[key] = v;
        }
    }
    return out;
}

export function deactivate() {}

// Exported for tests
export function determineInsertionLine(document: vscode.TextDocument, fileExtension: string): number {
    for (let index = 0; index < document.lineCount; index++) {
        const text = document.lineAt(index).text;
        const trimmed = text.trim();

        if (trimmed.length === 0) {
            if (index === 0) {
                continue;
            }
            return index;
        }

        if (index === 0 && trimmed.startsWith('#!')) {
            continue;
        }

        if (fileExtension === '.php' && isPhpOpeningTag(trimmed)) {
            continue;
        }

        if (fileExtension === '.rb' && (isRubyFrozenStringLiteralLine(trimmed) || isRubyEncodingComment(trimmed))) {
            continue;
        }

        if (fileExtension === '.py' && isPythonEncodingComment(trimmed)) {
            continue;
        }

        // Stop once we hit the first meaningful line we shouldn't skip.
        return index;
    }

    return document.lineCount;
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
    return PHP_OPEN_TAG_REGEX.test(line.trim());
}

export { getCommentSyntax };
