/**
 * Cucumber html reporter.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/html_formatter.ts
 */
import { finished } from 'node:stream/promises';
import CucumberHtmlStream from '@cucumber/html-formatter';
import { BaseReporter, BaseReporterOptions } from './baseReporter';
import { resolvePackageRoot } from '../../utils';
import path from 'node:path';

export type HtmlReporterOptions = {
  outputFile?: string;
};

export class HtmlReporter extends BaseReporter {
  private htmlStream: CucumberHtmlStream;

  constructor(
    baseOptions: BaseReporterOptions,
    protected options: HtmlReporterOptions = {},
  ) {
    super(baseOptions);
    if (this.options.outputFile) {
      this.setOutputStreamToFile(this.options.outputFile);
    }
    const packageRoot = resolvePackageRoot('@cucumber/html-formatter');
    this.htmlStream = new CucumberHtmlStream(
      path.join(packageRoot, 'dist/main.css'),
      path.join(packageRoot, 'dist/main.js'),
    );
    this.eventBroadcaster.on('envelope', (envelope) => {
      this.htmlStream.write(envelope);
    });
    this.htmlStream.pipe(this.outputStream);
  }

  async finished() {
    this.htmlStream.end();
    await finished(this.htmlStream);
    await super.finished();
  }
}
