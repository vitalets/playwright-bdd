import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/gen/cli.ts', 'src/index.ts'],
  project: ['src/**/*.ts'],
  ignore: ['**/*.d.ts'],
  ignoreDependencies: [
    '@cucumber/messages',
    '@cucumber/cucumber-expressions',
    '@cucumber/gherkin',
    'lint-staged',
    'np',
    'npm-run-all',
  ],
};

export default config;
