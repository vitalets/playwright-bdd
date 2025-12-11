import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/cli/worker.ts', // prettier-ignore
    // this file is copied from playwright, so keep all exports as is
    'src/playwright/stackTrace.ts',
    'scripts/**',
    // We need to check all files until we create a playwright-bdd knip plugin
    'examples/**',
    'test/**',
    // Exlcude generated files and folders
    '!**/.features-gen/**',
    '!**/{cucumber-report,actual-reports}/**',
    '!**/dist/**',
    // This generated folder triggers knip to treat react as used dependency
    '!test/component-tests/playwright/.cache',
  ],
  // this is a knip default, keep it here for readability
  project: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!'],
  ignoreBinaries: [
    // binaries that used ad-hoc with npx
    'docsify',
    'tsx',
    'npm-check-updates',
  ],
  ignoreDependencies: [
    // Keep @cucumber/compatibility-kit to inspec their tests manually
    '@cucumber/compatibility-kit',
    // Used dynamically in test/reporter-cucumber-custom
    '@cucumber/pretty-formatter',
    // Used dynamically to get traceViewer assets
    'playwright-core',
    // Didn't find a way to remove 'lint-staged' from ignoreDependencies, although it's used in scripts/git-hooks/pre-commit
    'lint-staged',
    // Used in examples
    'npm-run-all',
    // Used in examples and test/reporter-cucumber-ext-attachments
    'http-server',
    // Used in test/decorators-js to pass custom babel config
    '@babel/plugin-proposal-decorators',
    // Used implicitly in component-tests
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    // used programmatically in tests
    'ts-node',
  ],
};

export default config;
