/**
 * BDD Config type.
 */
import { ImportTestFrom } from '../gen/formatter';
import { defaults } from './defaults';
import { DisableWarningsConfig } from './warnings';

// keep these fields for some time until full refuse of cucumber
type CucumberConfigDeprecated = {
  paths?: string[];
  import?: string[];
  require?: string[];
};

export type BDDInputConfig = CucumberConfigDeprecated & {
  /**
   * Step definition pattern(s), e.g. 'steps/*'.
   * Always use forward slash.
   */
  steps?: string | string[];
  /**
   * Features definition pattern(s), e.g. 'features/*.feature'.
   * Always use forward slash.
   */
  features?: string | string[];
  /** Parent directory for all feature files used to construct output paths */
  featuresRoot?: string;
  /** Dir to save generated files */
  outputDir?: string;
  /** Path to file for importing test instance */
  importTestFrom?: string | ImportTestFrom;
  /**
   * Default language for your feature files.
   * @default "en"
   */
  language?: string;
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
  /** Add special BDD attachments for Cucumber reports */
  enrichReporterData?: boolean;
  /** Set to true if your POMs have a state */
  statefulPoms?: boolean;
  /** Disable warnings */
  disableWarnings?: DisableWarningsConfig;
};

export type BDDConfig = BDDInputConfig &
  typeof defaults & {
    featuresRoot: string;
    importTestFrom?: ImportTestFrom;
    features: string | string[];
    steps: string | string[];
  };
