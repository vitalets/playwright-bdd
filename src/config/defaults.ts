import { BDDInputConfig } from './types';

export const defaults: Required<
  Pick<BDDInputConfig, 'outputDir' | 'verbose' | 'quotes' | 'language'>
> = {
  outputDir: '.features-gen',
  verbose: false,
  quotes: 'double',
  language: 'en',
};
