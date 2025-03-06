import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/cli/index.ts', // prettier-ignore
    'src/cli/worker.ts',
    'src/index.ts',
    'src/decorators.ts',
    'src/reporter/cucumber/index.ts',
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
    'np',
    'npm-run-all',
    'publint',
    'http-server',
  ],
};

export default config;
