import * as assert from 'assert';

// Import compiled extension to test the helper. Tests run after `npm run compile` builds `dist/extension.js`.
// The compiled tests live in `out/test`, so this relative path resolves to the built extension.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ext = require('../../dist/extension.js');

suite('getCommentSyntax', () => {
  test('maps common extensions', () => {
    assert.strictEqual(ext.getCommentSyntax('.ts'), '//');
    assert.strictEqual(ext.getCommentSyntax('.tsx'), '//');
    assert.strictEqual(ext.getCommentSyntax('.js'), '//');
    assert.strictEqual(ext.getCommentSyntax('.jsx'), '//');
    assert.strictEqual(ext.getCommentSyntax('.py'), '#');
    assert.strictEqual(ext.getCommentSyntax('.rb'), '#');
    assert.strictEqual(ext.getCommentSyntax('.go'), '//');
    assert.strictEqual(ext.getCommentSyntax('.php'), '//');
  });

  test('returns null for unknown extension', () => {
    assert.strictEqual(ext.getCommentSyntax('.unknownext'), null);
  });
});

