import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<
    BDDInputConfig,
    'outputDir' | 'verbose' | 'quotes' | 'language' | 'missingSteps' | 'arityCheck' | 'lockFile'
  >
> & { sourceMaps: boolean } = {
  outputDir: '.features-gen',
  // Keep sourceMaps internal until the required Playwright VS Code extension update is released.
  // Restore BDDInputConfig and public docs then; see docs/guides/source-maps.md.
  sourceMaps: false,
  verbose: false,
  quotes: 'single',
  language: 'en',
  missingSteps: 'fail-on-gen',
  arityCheck: true,
  lockFile: false,
};

export const watchDefaults = {
  packageRoot: true,
  gitIgnore: true,
  include: [],
  exclude: [],
  extensions: ['.feature', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx'],
} satisfies Required<NonNullable<BDDInputConfig['watch']>>;
