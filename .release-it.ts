import type { Config } from 'release-it';

export default {
  github: {
    release: true,
  },
  npm: {
    skipChecks: true, // Required for trusted publishing with OIDC
  },
  plugins: {
    '@release-it/keep-a-changelog': {
      filename: 'CHANGELOG.md',
      addUnreleased: true,
      addVersionUrl: true,
    },
  },
} satisfies Config;
