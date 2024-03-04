/**
 * Custom Cucumber reporter.
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/custom_formatters.md
 */
import BaseReporter, { InternalOptions } from './base';
import { requireOrImportDefaultFunction } from '../../playwright/loadUtils';
import Formatter, { IFormatterOptions } from '../../cucumber/formatter';
import getColorFns from '../../cucumber/formatter/getColorFns';
import StepDefinitionSnippetBuilder from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder';
import { ISupportCodeLibrary } from '../../cucumber/types';

export type CustomReporterOptions = {
  colorsEnabled?: boolean;
  outputFile?: string;
  [k: string]: unknown;
};

export default class CustomReporter extends BaseReporter {
  private formatter?: Formatter;

  constructor(
    internalOptions: InternalOptions,
    protected reporterPathOrModule: string,
    protected userOptions: CustomReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
  }

  printsToStdio() {
    // currently always return true, b/c loading of custom reporter is async,
    // but printsToStdio() is called synchronously at the beginning.
    return true;
  }

  async init() {
    const formatterOptions = this.buildFormatterOptions();
    const FormatterConstructor = await this.loadFormatterFromFile();
    this.formatter = new FormatterConstructor(formatterOptions) as Formatter;
  }

  async finished() {
    await this.formatter?.finished();
    await super.finished();
  }

  protected async loadFormatterFromFile() {
    // see: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/config.ts#L225
    const reporterPath = require.resolve(this.reporterPathOrModule, {
      paths: [this.internalOptions.cwd],
    });
    return requireOrImportDefaultFunction(reporterPath, true);
  }

  protected buildFormatterOptions(): IFormatterOptions {
    const colorFns = getColorFns(this.outputStream, process.env, this.userOptions.colorsEnabled);
    return {
      cwd: this.internalOptions.cwd,
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: this.eventDataCollector,
      parsedArgvOptions: this.userOptions,
      colorFns,
      stream: this.outputStream,
      log: this.outputStream.write.bind(this.outputStream),
      cleanup: async () => {},
      snippetBuilder: null as unknown as StepDefinitionSnippetBuilder,
      supportCodeLibrary: {
        World: {},
      } as unknown as ISupportCodeLibrary,
    };
  }
}

// const fakeSuportCodeLibrary = {
//   parameterTypeRegistry: ParameterTypeRegistry;
// stepDefinitions: StepDefinition[];
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// World: any;
// originalCoordinates: ISupportCodeCoordinates;
// }
