/**
 * Handles externalizing attachments.
 */
import fs from 'node:fs';
import * as messages from '@cucumber/messages';
import path from 'node:path';
import mime from 'mime-types';
import { calculateSha1 } from '../../../utils';
import { sanitizeForFilePath } from '../../../utils/paths';
import { getAttachmentBodyAsBuffer } from './helpers';

export function toEmbeddedAttachment(attachment: messages.Attachment): messages.Attachment {
  if (attachment.body) return attachment;

  const attachmentPath = attachment.url;
  if (!attachmentPath) {
    throw new Error(`Attachment without body and url: ${JSON.stringify(attachment)}`);
  }

  // add cache for file reading

  const body = fs.readFileSync(attachmentPath).toString('base64');
  const contentEncoding = messages.AttachmentContentEncoding.BASE64;

  return {
    ...attachment,
    body,
    contentEncoding,
    url: undefined,
  };
}

/**
 * See implementation in Playwright HTML reporter:
 * https://github.com/microsoft/playwright/blob/412073253f03099d0fe4081b26ad5f0494fea8d2/packages/playwright/src/reporters/html.ts#L428
 */
export function toExternalAttachment(
  attachment: messages.Attachment,
  attachmentsDir: string,
  attachmentsBaseURL: string,
): messages.Attachment {
  // add cache for file reading

  const buffer = attachment.url
    ? fs.readFileSync(attachment.url)
    : getAttachmentBodyAsBuffer(attachment);

  const extension = getAttachmentExtension(attachment);
  const fileName = calculateSha1(buffer) + '.' + extension;
  const filePath = path.join(attachmentsDir, fileName);
  // todo: save file async?
  // without converting to Uint8Array TS complains about buffer type
  fs.writeFileSync(filePath, new Uint8Array(buffer));

  return {
    ...attachment,
    contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
    body: '',
    url: `${attachmentsBaseURL}/${fileName}`,
  };
}

/**
 * Returns extension for the attachment (without dot).
 */
function getAttachmentExtension(attachment: messages.Attachment) {
  if (attachment.url) return path.extname(attachment.url).replace(/^\./, '');
  const extFromFileName = attachment.fileName
    ? sanitizeForFilePath(path.extname(attachment.fileName).replace(/^\./, ''))
    : '';
  return extFromFileName || mime.extension(attachment.mediaType) || 'dat';
}

// See also PW implementation: https://github.com/microsoft/playwright/blob/412073253f03099d0fe4081b26ad5f0494fea8d2/packages/playwright/src/reporters/html.ts#L572
export function isTextAttachment(attachment: messages.Attachment) {
  return /^(text\/|application\/json)/.test(attachment.mediaType);
}
