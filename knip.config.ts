import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/cli/index.ts', // prettier-ignore
    'src/cli/worker.ts',
    'src/index.ts',
    'src/decorators.ts',
    'src/reporter/cucumber/index.ts',
  ],
  project: ['src/**/*.ts'],
  ignore: ['**/*.d.ts'],
  ignoreBinaries: ['docsify'],
  ignoreDependencies: [
    // @cucumber/* dependencies are installed by @cucumber/cucumber
    // todo: remove them from this list after removing @cucumber/cucumber dependency
    '@cucumber/messages',
    '@cucumber/cucumber-expressions',
    '@cucumber/gherkin',
    '@cucumber/gherkin-streams',
    '@cucumber/gherkin-utils',
    '@cucumber/tag-expressions',
    '@cucumber/compatibility-kit',
    '@cucumber/html-formatter',
    '@cucumber/pretty-formatter',
    'xmlbuilder',
    'chalk',
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
