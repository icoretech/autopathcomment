import * as assert from 'node:assert/strict';
import { getCommentSyntax } from '../extension';

suite('Default comment syntax', () => {
  for (const extension of [
    'ts',
    'tsx',
    'js',
    'jsx',
    'mjs',
    'cjs',
    'mts',
    'cts',
    'rs',
    'java',
    'c',
    'cpp',
    'cc',
    'cxx',
    'h',
    'hpp',
    'cs',
    'go',
    'php',
    'kt',
    'kts',
    'swift',
    'dart',
  ]) {
    test(`uses slash comments for .${extension}`, () => {
      // Given / When / Then
      assert.equal(getCommentSyntax(`.${extension}`), '//');
    });
  }
  for (const extension of [
    'py',
    'rb',
    'tf',
    'hcl',
    'sh',
    'bash',
    'yaml',
    'yml',
    'toml',
    'ex',
    'exs',
  ]) {
    test(`uses hash comments for .${extension}`, () => {
      // Given / When / Then
      assert.equal(getCommentSyntax(`.${extension}`), '#');
    });
  }
  for (const extension of ['lua', 'sql']) {
    test(`uses dash comments for .${extension}`, () => {
      // Given / When / Then
      assert.equal(getCommentSyntax(`.${extension}`), '--');
    });
  }
  test('returns null for unsupported formats', () => {
    // Given / When / Then
    assert.equal(getCommentSyntax('.json'), null);
    assert.equal(getCommentSyntax('.html'), null);
  });
});
