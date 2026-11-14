import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<
    BDDInputConfig,
    | 'outputDir'
    | 'sourceMaps'
    | 'verbose'
    | 'quotes'
    | 'language'
    | 'missingSteps'
    | 'arityCheck'
    | 'lockFile'
  >
> = {
  outputDir: '.features-gen',
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
