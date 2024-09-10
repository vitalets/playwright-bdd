/**
 * Cucumber message reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/message_formatter.ts
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions, isAttachmentAllowed, SkipAttachments } from './base';

type MessageReporterOptions = {
  outputFile?: string;
  skipAttachments?: SkipAttachments;
};

export default class MessageReporter extends BaseReporter {
  constructor(
    internalOptions: InternalOptions,
    protected userOptions: MessageReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (!isAttachmentAllowed(envelope, this.userOptions.skipAttachments)) return;
      this.outputStream.write(JSON.stringify(envelope) + '\n');
    });
  }
}
