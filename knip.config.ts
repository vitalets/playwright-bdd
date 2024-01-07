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
    '@cucumber/gherkin-streams',
    '@cucumber/gherkin-utils',
    '@cucumber/tag-expressions',
    '@types/react',
    '@types/react-dom',
    'react',
    'react-dom',
    'lint-staged',
    'np',
    'npm-run-all',
    'publint',
    'cross-env',
  ],
};

export default config;
