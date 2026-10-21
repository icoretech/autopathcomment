import {
  globSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@vscode/test-cli';

// Every run gets a disposable multi-root workspace, including an outside sibling.
const testRoot = mkdtempSync(join(tmpdir(), 'autopathcomment-test-'));
mkdirSync(join(testRoot, 'workspace', 'nested'), { recursive: true });
mkdirSync(join(testRoot, 'workspace-other'));
const workspaceFile = join(testRoot, 'test.code-workspace');
writeFileSync(
  workspaceFile,
  JSON.stringify({
    folders: [{ path: './workspace' }, { path: './workspace/nested' }],
  }),
);
process.env.AUTOPATHCOMMENT_TEST_ROOT = testRoot;
process.once('exit', () => rmSync(testRoot, { recursive: true, force: true }));

export default defineConfig({
  // Ignore stale output from tests that no longer exist in the source tree.
  files: globSync('src/test/**/*.test.ts').map((file) =>
    file.replace(/^src[/\\]/, 'out/').replace(/\.ts$/, '.js'),
  ),
  // Pin VS Code version via env for cacheability; falls back to latest stable
  version: process.env.VSCODE_VERSION || 'stable',
  workspaceFolder: workspaceFile,
  launchArgs: [
    `--user-data-dir=${join(testRoot, 'user-data')}`,
    `--extensions-dir=${join(testRoot, 'extensions')}`,
    '--disable-extensions',
    '--skip-welcome',
    '--skip-release-notes',
    '--disable-workspace-trust',
  ],
  mocha: { timeout: 10000 },
});
