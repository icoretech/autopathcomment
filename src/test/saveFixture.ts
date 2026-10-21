import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';

export function testRoot(): string {
  const base = process.env.AUTOPATHCOMMENT_TEST_ROOT;
  assert.ok(base, 'test runner must provide a disposable workspace');
  return base;
}

export async function activateExtension(): Promise<void> {
  const extension = vscode.extensions.getExtension('icoretech.autopathcomment');
  assert.ok(extension, 'installed development extension');
  await extension.activate();
}

export async function save(relative: string, content: string): Promise<string> {
  const filename = path.join(testRoot(), relative);
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, '');
  const document = await vscode.workspace.openTextDocument(
    vscode.Uri.file(filename),
  );
  const edit = new vscode.WorkspaceEdit();
  edit.set(document.uri, [
    vscode.TextEdit.setEndOfLine(
      content.includes('\r\n') ? vscode.EndOfLine.CRLF : vscode.EndOfLine.LF,
    ),
    vscode.TextEdit.insert(new vscode.Position(0, 0), content),
  ]);
  assert.equal(await vscode.workspace.applyEdit(edit), true);
  assert.equal(await document.save(), true);
  assert.equal(document.isDirty, false);
  return fs.readFile(filename, 'utf8');
}
