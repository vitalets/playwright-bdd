import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<
    BDDInputConfig,
    'outputDir' | 'verbose' | 'quotes' | 'language' | 'missingSteps' | 'arityCheck'
  >
> = {
  outputDir: '.features-gen',
  verbose: false,
  quotes: 'single',
  language: 'en',
  missingSteps: 'fail-on-gen',
  arityCheck: true,
};
