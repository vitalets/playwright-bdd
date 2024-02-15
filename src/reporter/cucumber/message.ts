/**
 * Cucumber message reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/message_formatter.ts
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { BaseReporterOptions } from './base';

type MessageReporterOptions = {
  outputFile?: string;
};

export default class MessageReporter extends BaseReporter {
  constructor(
    baseReporterOptions: BaseReporterOptions,
    protected options: MessageReporterOptions = {},
  ) {
    super(baseReporterOptions);
    this.setOutputStream(this.options.outputFile);
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.outputStream.write(JSON.stringify(envelope) + '\n');
    });
  }
}
