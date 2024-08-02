import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/cli/index.ts', // prettier-ignore
    'src/cli/worker.ts',
    'src/index.ts',
    'src/decorators.ts',
    'src/reporter/cucumber/index.ts',
    'test/**',
  ],
  project: ['src/**/*.ts'],
  ignore: ['**/*.d.ts'],
  ignoreBinaries: ['docsify'],
  ignoreDependencies: [
    '@cucumber/compatibility-kit',
    '@cucumber/pretty-formatter',
    '@types/react-dom',
    'react-dom',
    'lint-staged',
    'np',
    'npm-run-all',
    'publint',
    'cross-env',
  ],
};

export default config;
