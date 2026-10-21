import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';

import { activateExtension, save, testRoot } from './saveFixture';

suite('Workspace document saves', () => {
  suiteSetup(activateExtension);
  test('uses the innermost root when saving a nested workspace file', async () => {
    // Given / When
    const result = await save('workspace/nested/source.ts', 'const value = 1;');
    // Then
    assert.equal(result, '// source.ts\n\nconst value = 1;');
  });

  test('leaves a sibling directory outside the workspace unchanged', async () => {
    // Given / When
    const result = await save('workspace-other/source.ts', 'const value = 1;');
    // Then
    assert.equal(result, 'const value = 1;');
  });

  test('does not duplicate the path on a later dirty save', async () => {
    // Given
    await save('workspace/repeated.ts', 'const value = 1;');
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(path.join(testRoot(), 'workspace/repeated.ts')),
    );
    const edit = new vscode.WorkspaceEdit();
    edit.insert(
      document.uri,
      document.lineAt(document.lineCount - 1).range.end,
      '\nconst next = 2;',
    );
    assert.equal(await vscode.workspace.applyEdit(edit), true);
    // When
    assert.equal(await document.save(), true);
    // Then
    assert.equal(
      await fs.readFile(document.uri.fsPath, 'utf8'),
      '// repeated.ts\n\nconst value = 1;\nconst next = 2;',
    );
  });

  test('preserves CRLF on disk when inserting a path', async () => {
    // Given / When
    const result = await save(
      'workspace/windows.ts',
      'const value = 1;\r\nconst next = 2;',
    );
    // Then
    assert.equal(
      result,
      '// windows.ts\r\n\r\nconst value = 1;\r\nconst next = 2;',
    );
  });

  test('preserves an existing UTF-8 BOM on disk', async () => {
    // Given
    const filename = path.join(testRoot(), 'workspace/bom.ts');
    await fs.writeFile(filename, '\uFEFFconst value = 1;');
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(filename),
    );
    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, document.lineAt(0).range.end, '\n');
    assert.equal(await vscode.workspace.applyEdit(edit), true);
    // When
    assert.equal(await document.save(), true);
    // Then
    assert.equal(
      await fs.readFile(filename, 'utf8'),
      '\uFEFF// bom.ts\n\nconst value = 1;\n',
    );
  });

  test('skips paths containing a line break', async () => {
    // Given / When
    const result = await save('workspace/line\nbreak.ts', 'const value = 1;');
    // Then
    assert.equal(result, 'const value = 1;');
  });

  test('skips PHP paths containing a closing tag', async () => {
    // Given / When
    const result = await save('workspace/tag?>.php', '<?php\necho 1;');
    // Then
    assert.equal(result, '<?php\necho 1;');
  });
});
