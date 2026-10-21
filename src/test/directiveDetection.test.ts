import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';
import {
  determineInsertionLine,
  isPhpOpeningTag,
  isPythonEncodingComment,
  isRubyEncodingComment,
  isRubyFrozenStringLiteralLine,
} from '../extension';

suite('Directive detection', () => {
  for (const line of [
    '# encoding: utf-8',
    '# coding: utf-8',
    '# -*- coding: utf-8 -*-',
    '# vim: set fileencoding=utf-8 :',
  ]) {
    test(`recognizes Ruby encoding ${line}`, () => {
      // Given / When / Then
      assert.equal(isRubyEncodingComment(line), true);
    });
  }
  test('recognizes Ruby frozen-string Emacs declarations', () => {
    // Given / When / Then
    assert.equal(
      isRubyFrozenStringLiteralLine('# -*- frozen_string_literal: true -*-'),
      true,
    );
  });
  test('rejects unrelated Ruby comments', () => {
    // Given / When / Then
    assert.equal(isRubyEncodingComment('# ordinary comment'), false);
    assert.equal(isRubyFrozenStringLiteralLine('# ordinary comment'), false);
  });
  test('recognizes a Python encoding declaration', () => {
    // Given / When / Then
    assert.equal(isPythonEncodingComment('# -*- coding: utf-8 -*-'), true);
    assert.equal(isPythonEncodingComment('# coding=utf-8'), true);
  });
  test('accepts only standalone full PHP opening tags', () => {
    // Given / When / Then
    assert.equal(isPhpOpeningTag('<?php'), true);
    assert.equal(isPhpOpeningTag('<?= 1 ?>'), false);
    assert.equal(isPhpOpeningTag('<?php echo 1;'), false);
  });
  for (const scenario of [
    { content: '<?php\n\necho 1;', extension: '.php', expected: 1 },
    { content: '\n\n<?php\necho 1;', extension: '.php', expected: 3 },
    { content: 'echo 1;', extension: '.php', expected: -1 },
    {
      content: '#!/usr/bin/env python3\n# coding: utf-8\nprint(1)',
      extension: '.py',
      expected: 2,
    },
    {
      content: '# frozen_string_literal: true\n# encoding: utf-8\nputs 1',
      extension: '.rb',
      expected: 2,
    },
  ]) {
    test(`finds insertion line for ${JSON.stringify(scenario.content)}`, async () => {
      // Given
      const document = await vscode.workspace.openTextDocument({
        content: scenario.content,
      });
      // When
      const line = determineInsertionLine(document, scenario.extension);
      // Then
      assert.equal(line, scenario.expected);
    });
  }
});
