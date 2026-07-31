import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<
    BDDInputConfig,
    | 'outputDir'
    | 'generateSourceMaps'
    | 'verbose'
    | 'quotes'
    | 'language'
    | 'missingSteps'
    | 'arityCheck'
  >
> = {
  outputDir: '.features-gen',
  generateSourceMaps: false,
  verbose: false,
  quotes: 'single',
  language: 'en',
  missingSteps: 'fail-on-gen',
  arityCheck: true,
};
