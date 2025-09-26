// src/extension.ts

// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as path from 'path';

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

        // Check the first line
        const firstLine = document.lineAt(0).text;

        // If the file already starts with that exact line, do nothing
        if (firstLine.trim() === commentLine.trim()) {
            return;
        }

        // Detect a shebang (e.g. "#!/usr/bin/env python")
        const hasShebang = firstLine.startsWith('#!');

        // Use event.waitUntil(...) to apply the edit before the save finishes
        event.waitUntil((async () => {
            const edit = new vscode.WorkspaceEdit();

            if (hasShebang) {
                // Skip entirely if you never want to insert above shebang
                // If you prefer to insert BELOW the shebang, do something like:
                // edit.insert(document.uri, new vscode.Position(1, 0), commentToInsert);
                return;
            } else {
                // Normal case: insert comment at the top
                edit.insert(document.uri, new vscode.Position(0, 0), commentToInsert);
            }

            await vscode.workspace.applyEdit(edit);
        })());
    });

    context.subscriptions.push(willSaveListener);
}

function getCommentSyntax(extension: string): string | null {
    const commentSyntaxMap: { [key: string]: string } = {
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
    return commentSyntaxMap[extension] || null;
}

export function deactivate() {}

// Exported for tests
export { getCommentSyntax };
