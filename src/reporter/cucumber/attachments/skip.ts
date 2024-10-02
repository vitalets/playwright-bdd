/**
 * Handles skipping attachments.
 */
import { AttachmentEnvelope } from '../messagesBuilder/types';

export type SkipAttachments = boolean | ('image/png' | 'video/webm' | 'application/zip' | string)[];

export function shouldSkipAttachment(
  envelope: AttachmentEnvelope,
  skipAttachments?: SkipAttachments,
) {
  return Array.isArray(skipAttachments)
    ? skipAttachments.includes(envelope.attachment.mediaType)
    : Boolean(skipAttachments);
}
