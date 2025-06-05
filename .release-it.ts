import type { Config } from 'release-it';

export default {
  git: {
    requireCleanWorkingDir: true,
  },
  github: {
    release: true,
    web: true,
  },
  hooks: {
    'before:init': [
      'npm run docs:validate',
      'npx publint',
      'npm run knip',
      'npm ci',
      'npm run lint',
      'npm run prettier',
      'npm run build',
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
