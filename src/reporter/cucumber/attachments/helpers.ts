import * as messages from '@cucumber/messages';
import { AttachmentEnvelope } from '../messagesBuilder/types';

export function isAttachmentEnvelope(envelope: messages.Envelope): envelope is AttachmentEnvelope {
  return Boolean(envelope.attachment);
}

export function getAttachmentBodyAsBuffer(attachment: messages.Attachment) {
  const encoding =
    attachment.contentEncoding === messages.AttachmentContentEncoding.BASE64 ? 'base64' : 'utf-8';
  return Buffer.from(attachment.body, encoding);
}

export function getAttachmentBodyAsBase64(attachment: messages.Attachment) {
  return attachment.contentEncoding === messages.AttachmentContentEncoding.BASE64
    ? attachment.body
    : Buffer.from(attachment.body).toString('base64');
}
