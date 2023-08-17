import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/cli/index.ts', 'src/cli/worker.ts', 'src/index.ts', 'src/decorators.ts'],
  project: ['src/**/*.ts'],
  ignore: ['**/*.d.ts'],
  ignoreBinaries: ['docsify'],
  ignoreDependencies: [
    '@cucumber/messages',
    '@cucumber/cucumber-expressions',
    '@cucumber/gherkin',
    '@cucumber/tag-expressions',
    'lint-staged',
    'np',
    'npm-run-all',
    'publint',
  ],
};

export default config;
