/**
 * Class for getting attachment messages for a particular step.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { PwAttachment } from '../../../playwright/types.js';

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
      mediaType: pwAttachment.contentType,
      fileName: pwAttachment.name,
      body: '',
      contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
      // For attachments from global hooks (BeforeAll / AfterAll)
      // cucumber added 'testRunStartedId' field to associate attachment with test run.
      // This is not finalized yet, see: https://github.com/cucumber/cucumber-js/issues/1394
      // Playwright does not allow to attach files in global hooks,
      // b/c there is not testInfo.attach().
    };

    if (pwAttachment.path) {
      // For in-memory messages store absolute path in 'url' field.
      // In reporters we will replace it with relative path
      // or read attachment content and delete 'url' field.
      attachment.url = pwAttachment.path;
    } else if (pwAttachment.body) {
      // for now always attach as base64
      // todo: for text/plain and application/json use raw to save some bytes
      attachment.body = pwAttachment.body.toString('base64');
      attachment.contentEncoding = messages.AttachmentContentEncoding.BASE64;
    } else {
      throw new Error(`Playwright attachment without path and body`);
    }

    return { attachment };
  }
}
