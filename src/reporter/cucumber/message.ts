/**
 * Cucumber message reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/message_formatter.ts
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { BaseReporterOptions } from './base';

export type MessageReporterOptions = {
  outputFile?: string;
};

export default class MessageReporter extends BaseReporter {
  constructor(
    baseOptions: BaseReporterOptions,
    protected options: MessageReporterOptions = {},
  ) {
    super(baseOptions);
    this.setOutputStream(this.options.outputFile);
    baseOptions.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.outputStream.write(JSON.stringify(envelope) + '\n');
    });
  }
}
