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

/**
 * @public
 */
export function createLinkAttachment(
  testCaseStartedId: string | undefined,
  testStepId: string | undefined,
  href: string,
) {
  const attachment: messages.Attachment = {
    testCaseStartedId,
    testStepId,
    mediaType: 'text/uri-list',
    contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
    body: href,
  };
  return { attachment };
}

export function createLogAttachment(
  testCaseStartedId: string | undefined,
  testStepId: string | undefined,
  body: string,
) {
  const attachment: messages.Attachment = {
    testCaseStartedId,
    testStepId,
    mediaType: 'text/x.cucumber.log+plain',
    contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
    body,
  };
  return { attachment };
}
