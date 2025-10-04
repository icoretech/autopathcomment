import * as assert from 'assert';
import * as vscode from 'vscode';
// @ts-ignore - importing built CJS bundle for runtime
import * as ext from '../../dist/extension.js';

suite('Configuration override', () => {
  test('user settings override default map', async () => {
    const cfg = vscode.workspace.getConfiguration('autopathcomment');
    // Use a rarely used extension to avoid clashing with defaults
    await cfg.update('commentSyntaxMap', { '.foo': '#' }, vscode.ConfigurationTarget.Global);
    try {
      assert.strictEqual(ext.getCommentSyntax('.foo'), '#');
    } finally {
      // Cleanup
      await cfg.update('commentSyntaxMap', undefined, vscode.ConfigurationTarget.Global);
    }
  });
});
