import * as assert from 'assert';

// Import compiled extension helpers (tests run against dist output).
const ext = require('../../dist/extension.js');

suite('Directive detection helpers', () => {
  suite('isRubyFrozenStringLiteralLine', () => {
    test('detects canonical magic comment', () => {
      assert.strictEqual(ext.isRubyFrozenStringLiteralLine('# frozen_string_literal: true'), true);
    });

    test('handles extra whitespace and false value', () => {
      assert.strictEqual(ext.isRubyFrozenStringLiteralLine('  #   frozen_string_literal:   false  '), true);
    });

    test('rejects other comments', () => {
      assert.strictEqual(ext.isRubyFrozenStringLiteralLine('# some other comment'), false);
    });
  });

  suite('isRubyEncodingComment', () => {
    test('detects standard encoding comment', () => {
      assert.strictEqual(ext.isRubyEncodingComment('# encoding: utf-8'), true);
    });

    test('rejects non-encoding comments', () => {
      assert.strictEqual(ext.isRubyEncodingComment('# frozen_string_literal: true'), false);
    });
  });

  suite('isPythonEncodingComment', () => {
    test('matches -*- coding -*- declaration', () => {
      assert.strictEqual(ext.isPythonEncodingComment('# -*- coding: utf-8 -*-'), true);
    });

    test('matches coding= declaration', () => {
      assert.strictEqual(ext.isPythonEncodingComment('# coding=utf-8'), true);
    });

    test('rejects unrelated comments', () => {
      assert.strictEqual(ext.isPythonEncodingComment('# vim: set filetype=python'), false);
    });
  });

  suite('isPhpOpeningTag', () => {
    test('detects standard php opening tag', () => {
      assert.strictEqual(ext.isPhpOpeningTag('<?php'), true);
    });

    test('detects short echo tag', () => {
      assert.strictEqual(ext.isPhpOpeningTag('<?= $foo ?>'), true);
    });

    test('rejects non-php comment', () => {
      assert.strictEqual(ext.isPhpOpeningTag('// comment'), false);
    });
  });

  suite('determineInsertionLine', () => {
    const makeDoc = (lines: string[]) => ({
      lineCount: lines.length,
      lineAt(index: number) {
        return { text: lines[index] ?? '' };
      }
    });

    test('offsets insertion after php opening tag', () => {
      const doc = makeDoc(['<?php', '', '$foo = 1;']);
      assert.strictEqual(ext.determineInsertionLine(doc, '.php'), 1);
    });

    test('skips leading blanks before php opening tag', () => {
      const doc = makeDoc(['', '<?php', 'echo "hi";']);
      assert.strictEqual(ext.determineInsertionLine(doc, '.php'), 2);
    });

    test('returns zero for non-php files', () => {
      const doc = makeDoc(['import x from "y";']);
      assert.strictEqual(ext.determineInsertionLine(doc, '.ts'), 0);
    });

    test('returns zero when no php opening tag exists', () => {
      const doc = makeDoc(['// comment']);
      assert.strictEqual(ext.determineInsertionLine(doc, '.php'), 0);
    });

    test('moves past shebang on first line', () => {
      const doc = makeDoc(['#!/usr/bin/env python3', '', 'print("hi")']);
      assert.strictEqual(ext.determineInsertionLine(doc, '.py'), 1);
    });

    test('moves past ruby magic comments and encoding header', () => {
      const doc = makeDoc([
        '# frozen_string_literal: true',
        '# encoding: utf-8',
        '',
        'puts "hello"',
      ]);
      assert.strictEqual(ext.determineInsertionLine(doc, '.rb'), 2);
    });

    test('moves past shebang plus python encoding comment', () => {
      const doc = makeDoc([
        '#!/usr/bin/env python3',
        '# -*- coding: utf-8 -*-',
        'print("hi")',
      ]);
      assert.strictEqual(ext.determineInsertionLine(doc, '.py'), 2);
    });
  });
});
