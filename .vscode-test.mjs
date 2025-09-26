import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  // Pin VS Code version via env for cacheability; falls back to latest stable
  version: process.env.VSCODE_VERSION || 'stable',
});
