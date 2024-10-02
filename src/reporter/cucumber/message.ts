/**
 * Cucumber message reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/message_formatter.ts
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions } from './base';
import { AttachmentEnvelope } from './messagesBuilder/types';
import { isAttachmentEnvelope } from './attachments/helpers';
import { shouldSkipAttachment, SkipAttachments } from './attachments/skip';
import { toEmbeddedAttachment } from './attachments/external';

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
      if (isAttachmentEnvelope(envelope)) {
        this.handleAttachment(envelope);
      } else {
        this.writeEnvelope(envelope);
      }
    });
  }

  protected handleAttachment(envelope: AttachmentEnvelope) {
    if (shouldSkipAttachment(envelope, this.userOptions.skipAttachments)) return;

    this.writeEnvelope({
      ...envelope,
      attachment: toEmbeddedAttachment(envelope.attachment),
    });
  }

  protected writeEnvelope(envelope: messages.Envelope) {
    this.outputStream.write(JSON.stringify(envelope) + '\n');
  }
}
