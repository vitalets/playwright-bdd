import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/cli/worker.ts', // prettier-ignore
    'scripts/**',
    'examples/**',
    'test/**',
    // this file is copied from playwright, so keep all exports as is
    'src/playwright/stackTrace.ts',
  ],
  ignore: ['**/*.d.ts', '**/.features-gen/**'],
  ignoreBinaries: ['docsify'],
  ignoreDependencies: [
    '@cucumber/compatibility-kit',
    '@cucumber/pretty-formatter',
    'playwright-core',
    'lint-staged',
    'npm-run-all',
    'http-server',
    // Used in test/decorators-js to pass custom babel config
    '@babel/plugin-proposal-decorators',
  ],
};

export default config;
