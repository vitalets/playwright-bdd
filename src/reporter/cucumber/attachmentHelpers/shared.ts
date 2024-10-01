import * as messages from '@cucumber/messages';
import { AttachmentEnvelope } from '../messagesBuilder/types';

export function isAttachmentEnvelope(envelope: messages.Envelope): envelope is AttachmentEnvelope {
  return Boolean(envelope.attachment);
}
