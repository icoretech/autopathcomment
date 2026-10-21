import * as assert from 'node:assert/strict';
import { activateExtension, save } from './saveFixture';

suite('Language document saves', () => {
  let fixture = 0;
  suiteSetup(activateExtension);
  const cases = [
    {
      name: 'swift package tools version',
      ext: 'swift',
      input: '// swift-tools-version: 5.9\nimport PackageDescription',
      prefix: '// swift-tools-version: 5.9\n',
      syntax: '//',
    },
    {
      name: 'swift tools version without newline',
      ext: 'swift',
      input: '// swift-tools-version: 5.9',
      prefix: '// swift-tools-version: 5.9\n',
      syntax: '//',
    },
    {
      name: 'python blank first line and encoding',
      ext: 'py',
      input: '\n# coding: utf-8\nprint(1)',
      prefix: '\n# coding: utf-8\n',
      syntax: '#',
    },
    {
      name: 'ordinary source',
      ext: 'ts',
      input: 'export const value = 1;',
      prefix: '',
      syntax: '//',
    },
    {
      name: 'shebang without newline',
      ext: 'sh',
      input: '#!/bin/sh',
      prefix: '#!/bin/sh\n',
      syntax: '#',
    },
    {
      name: 'encoding without newline',
      ext: 'py',
      input: '# coding: utf-8',
      prefix: '# coding: utf-8\n',
      syntax: '#',
    },
    {
      name: 'ruby emacs encoding',
      ext: 'rb',
      input: '# -*- coding: utf-8 -*-\nputs 1',
      prefix: '# -*- coding: utf-8 -*-\n',
      syntax: '#',
    },
    {
      name: 'ruby frozen string directive',
      ext: 'rb',
      input: '# frozen_string_literal: true\nputs 1',
      prefix: '# frozen_string_literal: true\n',
      syntax: '#',
    },
    {
      name: 'python second-line encoding',
      ext: 'py',
      input: '# ordinary comment\n# coding=utf-8\nprint(1)',
      prefix: '# ordinary comment\n# coding=utf-8\n',
      syntax: '#',
    },
    {
      name: 'php opening only',
      ext: 'php',
      input: '<?php',
      prefix: '<?php\n',
      syntax: '//',
    },
    {
      name: 'php with closing tag',
      ext: 'php',
      input: '<?php\necho 1;\n?>',
      prefix: '<?php\n',
      syntax: '//',
    },
    {
      name: 'uppercase extension',
      ext: 'TS',
      input: 'export const value = 1;',
      prefix: '',
      syntax: '//',
    },
  ] as const;

  for (const scenario of cases) {
    test(`inserts a path when saving ${scenario.name}`, async () => {
      // Given
      const filename = `case-${fixture++}.${scenario.ext}`;
      const remaining = scenario.input
        .slice(scenario.prefix.trimEnd().length)
        .replace(/^\n/, '');
      // When
      const result = await save(`workspace/${filename}`, scenario.input);
      // Then
      assert.equal(
        result,
        `${scenario.prefix}${scenario.syntax} ${filename}\n\n${remaining}`,
      );
    });
  }

  for (const scenario of [
    { ext: 'cjs', content: 'module.exports = 1;', syntax: '//' },
    { ext: 'mts', content: 'export const value = 1;', syntax: '//' },
    { ext: 'hpp', content: '#pragma once', syntax: '//' },
    { ext: 'kt', content: 'val value = 1', syntax: '//' },
    { ext: 'yaml', content: '%YAML 1.2\n---\nvalue: 1', syntax: '#' },
    { ext: 'toml', content: 'value = 1', syntax: '#' },
    { ext: 'exs', content: 'IO.puts(1)', syntax: '#' },
    { ext: 'lua', content: 'print(1)', syntax: '--' },
    { ext: 'sql', content: 'SELECT 1;', syntax: '--' },
  ]) {
    test(`saves a supported .${scenario.ext} file`, async () => {
      // Given
      const filename = `language-${fixture++}.${scenario.ext}`;
      // When
      const result = await save(`workspace/${filename}`, scenario.content);
      // Then
      assert.equal(
        result,
        `${scenario.syntax} ${filename}\n\n${scenario.content}`,
      );
    });
  }

  for (const content of [
    '<?php echo 1; ?>',
    '<?= 1 ?>',
    '<p>page</p>',
    '<?xml version="1.0"?>',
    '<?php ?>',
  ]) {
    test(`preserves unsafe PHP form ${JSON.stringify(content)}`, async () => {
      // Given / When
      const result = await save(`workspace/unsafe-${fixture++}.php`, content);
      // Then
      assert.equal(result, content);
    });
  }
});
