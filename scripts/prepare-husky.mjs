#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
import { env } from 'node:process';

// Skip hook setup in CI to avoid interfering with automated commits.
if (env.CI || env.HUSKY === '0') {
  process.exit(0);
}

const runGitConfig = spawnSync('git', ['config', 'core.hooksPath', '.husky'], {
  stdio: 'inherit',
});

if (runGitConfig.status !== null && runGitConfig.status !== 0) {
  process.exit(runGitConfig.status);
}

try {
  chmodSync('.husky/commit-msg', 0o755);
} catch (error) {
  // If the hook doesn't exist yet, surface the error for visibility.
  console.error('Failed to set execute bit on .husky/commit-msg:', error);
  process.exit(1);
}
