/**
 * Class for getting attachment messages for a particular step.
 */
import fs from 'node:fs';
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { PwAttachment } from '../../../playwright/types.js';
import path from 'node:path';

export class TestStepAttachments {
  constructor(
    private testCaseRun: TestCaseRun,
    private testStep: messages.TestStep,
    private pwStep?: pw.TestStep,
  ) {}

  buildMessages() {
    if (!this.pwStep) return [];
    return this.testCaseRun.attachmentMapper
      .getStepAttachments(this.pwStep)
      .map((pwAttachment) => this.buildAttachmentMessage(pwAttachment));
  }

  private buildAttachmentMessage(pwAttachment: PwAttachment) {
    const attachment: messages.Attachment = {
      testCaseStartedId: this.testCaseRun.id,
      testStepId: this.testStep.id,
      // for now always attach as base64
      // todo: for text/plain and application/json use raw to save some bytes
      body: this.getAttachmentBodyBase64(pwAttachment),
      contentEncoding: messages.AttachmentContentEncoding.BASE64,
      mediaType: pwAttachment.contentType,
      fileName: pwAttachment.name,
    };

    return { attachment };
  }

  private getAttachmentBodyBase64(pwAttachment: PwAttachment) {
    if (pwAttachment.path) {
      if (fs.existsSync(pwAttachment.path)) {
        return fs.readFileSync(pwAttachment.path, 'base64');
      }
      throw createMissingAttachmentError(pwAttachment.path);
    }
    if (pwAttachment.body) {
      return pwAttachment.body!.toString('base64');
    }
    throw new Error(`Playwright attachment without path and body`);
  }
}

function createMissingAttachmentError(attachmentPath: string) {
  const attachmentDir = path.join(path.dirname(attachmentPath));
  const attachmentDirExists = fs.existsSync(attachmentDir);
  const files = attachmentDirExists ? fs.readdirSync(attachmentDir) : [];
  const errorMsg = [
    `Attachment file is not found:`,
    attachmentPath,
    `Attachment dir ${attachmentDirExists ? 'exists' : 'does not exist'}.`,
    ...(attachmentDirExists ? [`Available files (${files.length}):`, ...files] : []),
    '',
  ].join('\n');
  return new Error(errorMsg);
}
