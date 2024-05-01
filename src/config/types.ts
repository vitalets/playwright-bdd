/**
 * BDD Config type.
 */
import { ImportTestFrom } from '../gen/formatter';
import { IConfiguration } from '@cucumber/cucumber/api';
import { defaults } from './defaults';

// todo: pick only relevant fields from cucumber config
export type CucumberConfig = Partial<IConfiguration>;

export type BDDInputConfig = OwnConfig & CucumberConfig;
export type BDDConfig = BDDInputConfig &
  typeof defaults & {
    featuresRoot: string;
    importTestFrom?: ImportTestFrom;
  };

export type OwnConfig = {
  /** Dir to save generated files */
  outputDir?: string;
  /** Path to file for importing test instance */
  importTestFrom?: string | ImportTestFrom;
  /** Verbose mode */
  verbose?: boolean;
  /** Skip generation of test files */
  skip?: boolean;
  /** Test title format for scenario outline examples */
  examplesTitleFormat?: string;
  /** Quotes style in generated tests */
  quotes?: 'single' | 'double' | 'backtick';
  /** Tags expression to filter scenarios for generation */
  tags?: string;
  /** Parent directory for all feature files used to construct output paths */
  featuresRoot?: string;
  /** Add special BDD attachments for Cucumber reports */
  enrichReporterData?: boolean;
  /** Set to true if your POMs have a state */
  statefulPoms?: boolean;
  /**
   * Step definition patterns, e.g. 'steps/*.{ts,js}'.
   * Always use forward slash.
   * Will replace Cucumber's 'require' / 'import'
   * @experimental
   */
  steps?: string | string[];
};
