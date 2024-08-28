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
  ],
  ignore: ['**/*.d.ts', '**/.features-gen/**'],
  ignoreBinaries: ['docsify'],
  ignoreDependencies: [
    '@cucumber/compatibility-kit',
    '@cucumber/pretty-formatter',
    'lint-staged',
    'np',
    'npm-run-all',
    'publint',
    'cross-env',
  ],
};

export default config;
