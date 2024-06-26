import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<BDDInputConfig, 'outputDir' | 'verbose' | 'examplesTitleFormat' | 'quotes' | 'language'>
> = {
  outputDir: '.features-gen',
  verbose: false,
  examplesTitleFormat: 'Example #<_index_>',
  quotes: 'double',
  language: 'en',
};
