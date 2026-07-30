import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<
    BDDInputConfig,
    'outputDir' | 'sourceMaps' | 'verbose' | 'quotes' | 'language' | 'missingSteps' | 'arityCheck'
  >
> = {
  outputDir: '.features-gen',
  sourceMaps: false,
  verbose: false,
  quotes: 'single',
  language: 'en',
  missingSteps: 'fail-on-gen',
  arityCheck: true,
};
