import type { Config } from 'release-it';

export default {
  git: {
    requireCleanWorkingDir: true,
  },
  hooks: {
    'before:init': [
      'npm run docs:validate',
      'npx publint',
      'npm run knip',
      'npm ci',
      'npm run lint',
      'npm run prettier',
      'npm run build', // call before tsc to get 'node_modules/playwright-bdd'
      'npm run tsc',
      'npx npm test',
      'npm run examples',
    ],
  },
  plugins: {
    '@release-it/keep-a-changelog': {
      filename: 'CHANGELOG.md',
      addUnreleased: true,
      addVersionUrl: true,
    },
  },
} satisfies Config;
