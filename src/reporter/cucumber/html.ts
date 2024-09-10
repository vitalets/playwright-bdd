/**
 * Cucumber html reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/html_formatter.ts
 * See: https://github.com/cucumber/html-formatter
 * See: https://github.com/cucumber/react-components
 */
import { finished } from 'node:stream/promises';
import * as messages from '@cucumber/messages';
import { CucumberHtmlStream } from '@cucumber/html-formatter';
import { resolvePackageRoot } from '../../utils';
import path from 'node:path';
import BaseReporter, { InternalOptions, isAttachmentAllowed, SkipAttachments } from './base';

type HtmlReporterOptions = {
  outputFile?: string;
  skipAttachments?: SkipAttachments;
};

export default class HtmlReporter extends BaseReporter {
  private htmlStream: CucumberHtmlStream;

  constructor(
    internalOptions: InternalOptions,
    protected userOptions: HtmlReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
    const packageRoot = resolvePackageRoot('@cucumber/html-formatter');
    this.htmlStream = new CucumberHtmlStream(
      path.join(packageRoot, 'dist/main.css'),
      path.join(packageRoot, 'dist/main.js'),
    );
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (!isAttachmentAllowed(envelope, this.userOptions.skipAttachments)) return;
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
