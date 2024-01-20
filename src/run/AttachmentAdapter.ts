/**
 * Adapter for Cucumber's AttachmentManager.
 * Tracks calls to world.attach() and world.log()
 * to be able to wait all attachment promises finish.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/attachment_manager/index.ts
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L101
 */

import { TestInfo } from '@playwright/test';
import AttachmentManager, { IAttachment, ICreateAttachment } from '../cucumber/AttachmentManager';

export class AttachmentAdapter {
  private attachmentManager: AttachmentManager;
  private promises: Promise<void>[] = [];

  constructor(private testInfo: TestInfo) {
    this.attachmentManager = new AttachmentManager((attachment) => {
      const promise = this.addAttachment(attachment);
      this.promises.push(promise);
    });
  }

  getLogFn() {
    return this.attachmentManager.log.bind(this.attachmentManager);
  }

  getAttachFn() {
    return this.attachmentManager.create.bind(this.attachmentManager) as ICreateAttachment;
  }

  async waitAttachmentsComplete() {
    await Promise.all(this.promises);
    this.promises.length = 0;
  }

  private async addAttachment(attachment: IAttachment) {
    const attachmentName = attachment.fileName || generateAttachmentName(attachment);
    await this.testInfo.attach(attachmentName, {
      body: attachment.data,
      contentType: attachment.media.contentType,
    });
  }
}

/**
 * Playwright requires attachment name.
 * Generate it like it's done in Cucumber HTML report.
 * See: https://github.com/cucumber/react-components/blob/main/src/components/gherkin/Attachment.tsx#L24
 */
export function generateAttachmentName(attachment: IAttachment) {
  const { contentType } = attachment.media;
  const suffix = ' (' + contentType + ')';

  if (contentType.match(/^image\//)) return 'Attached Image' + suffix;
  if (contentType.match(/^video\//)) return 'Attached Video' + suffix;
  if (contentType.match(/^text\//) || contentType.match(/^application\/json/)) {
    return 'Attached Text' + suffix;
  }

  return 'Attachment' + suffix;
}

export function isGeneratedAttachmentName(pwAttachment: { name: string; contentType: string }) {
  return pwAttachment.name.endsWith(' (' + pwAttachment.contentType + ')');
}
