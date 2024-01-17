/**
 * Cucumber message reporter.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/message_formatter.ts
 */
import * as messages from '@cucumber/messages';
import { BaseReporter, BaseReporterOptions } from './baseReporter';

export type MessageReporterOptions = {
  outputFile?: string;
};

export class MessageReporter extends BaseReporter {
  constructor(
    baseOptions: BaseReporterOptions,
    protected options: MessageReporterOptions = {},
  ) {
    super(baseOptions);
    if (this.options.outputFile) {
      this.setOutputStreamToFile(this.options.outputFile);
    }
    baseOptions.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.outputStream.write(JSON.stringify(envelope) + '\n');
    });
  }
}
