/**
 * Cucumber html reporter.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/html_formatter.ts
 */
import * as messages from '@cucumber/messages';
import { BaseReporter, BaseReporterOptions } from './baseReporter';

export type HtmlReporterOptions = {
  outputFile?: string;
};

export class HtmlReporter extends BaseReporter {
  constructor(
    baseOptions: BaseReporterOptions,
    protected options: HtmlReporterOptions = {},
  ) {
    super(baseOptions);
    // this.outputStream = new CucumberHtmlStream(
    //   resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) + '/dist/main.css',
    //   resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) + '/dist/main.js',
    // );
    baseOptions.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.outputStream.write(envelope);
    });
  }
}
