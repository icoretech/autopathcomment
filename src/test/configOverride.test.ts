import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as vscode from 'vscode';
import { getCommentSyntax } from '../extension';

suite('Configuration overrides', () => {
  test('normalizes override keys and file extensions', async () => {
    // Given
    const config = vscode.workspace.getConfiguration('autopathcomment');
    await config.update(
      'commentSyntaxMap',
      { FOO: '#' },
      vscode.ConfigurationTarget.Workspace,
    );
    try {
      // When / Then
      assert.equal(getCommentSyntax('.FOO'), '#');
    } finally {
      await config.update(
        'commentSyntaxMap',
        undefined,
        vscode.ConfigurationTarget.Workspace,
      );
    }
  });

  test('ignores multiline comment prefixes', async () => {
    // Given
    const config = vscode.workspace.getConfiguration('autopathcomment');
    await config.update(
      'commentSyntaxMap',
      { '.ts': '//\nexecute()' },
      vscode.ConfigurationTarget.Workspace,
    );
    try {
      // When / Then
      assert.equal(getCommentSyntax('.ts'), '//');
    } finally {
      await config.update(
        'commentSyntaxMap',
        undefined,
        vscode.ConfigurationTarget.Workspace,
      );
    }
  });

  test('uses the settings belonging to the document workspace folder', async () => {
    // Given
    const folders = vscode.workspace.workspaceFolders;
    assert.ok(folders && folders.length > 1);
    const nested = folders.find((folder) => folder.name === 'nested');
    assert.ok(nested);
    const config = vscode.workspace.getConfiguration(
      'autopathcomment',
      nested.uri,
    );
    await config.update(
      'commentSyntaxMap',
      { '.foo': '--' },
      vscode.ConfigurationTarget.WorkspaceFolder,
    );
    try {
      // When / Then
      assert.equal(
        getCommentSyntax('.foo', vscode.Uri.joinPath(nested.uri, 'source.foo')),
        '--',
      );
      assert.equal(getCommentSyntax('.foo'), null);
      const extension = vscode.extensions.getExtension(
        'icoretech.autopathcomment',
      );
      assert.ok(extension);
      await extension.activate();
      const uri = vscode.Uri.joinPath(nested.uri, 'scoped.foo');
      await fs.writeFile(uri.fsPath, '');
      const document = await vscode.workspace.openTextDocument(uri);
      const edit = new vscode.WorkspaceEdit();
      edit.insert(uri, new vscode.Position(0, 0), 'SELECT 1;');
      assert.equal(await vscode.workspace.applyEdit(edit), true);
      assert.equal(await document.save(), true);
      assert.equal(
        await fs.readFile(uri.fsPath, 'utf8'),
        '-- scoped.foo\n\nSELECT 1;',
      );
    } finally {
      await config.update(
        'commentSyntaxMap',
        undefined,
        vscode.ConfigurationTarget.WorkspaceFolder,
      );
    }
  });
});
