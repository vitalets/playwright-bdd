/**
 * Class for getting attachment messages for a particular step.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { toCucumberTimestamp } from './timing';
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
      // Use step start time as attachment timestamp (per-attachment timing is not available in Playwright).
      timestamp: toCucumberTimestamp(this.pwStep!.startTime.getTime()),
      // Note: 'testRunHookStartedId' (added in @cucumber/messages v28) could be used to
      // associate attachments from global hooks (BeforeAll/AfterAll) with TestRunHookStarted.
      // We don't emit TestRunHookStarted/Finished messages yet, so this field is not populated.
    };

    if (pwAttachment.path) {
      // For in-memory messages store absolute path in 'url' field.
      // In reporters we will replace it with relative path
      // or read attachment content and delete 'url' field.
      attachment.url = pwAttachment.path;
    } else if (pwAttachment.body) {
      // Use IDENTITY (raw UTF-8) for text types so the Cucumber HTML report can display
      // non-ASCII characters correctly. atob() in the browser decodes base64 as Latin-1,
      // so base64-encoding a UTF-8 string produces garbled output for multi-byte characters.
      // See: https://github.com/vitalets/playwright-bdd/issues/379
      if (isTextContentType(pwAttachment.contentType)) {
        attachment.body = pwAttachment.body.toString('utf8');
        attachment.contentEncoding = messages.AttachmentContentEncoding.IDENTITY;
      } else {
        attachment.body = pwAttachment.body.toString('base64');
        attachment.contentEncoding = messages.AttachmentContentEncoding.BASE64;
      }
    } else {
      throw new Error(`Playwright attachment without path and body`);
    }

    return { attachment };
  }
}

// Same pattern as isTextAttachment() in external.ts.
// Text content types use IDENTITY encoding so non-ASCII characters are preserved
// (base64 + browser atob() interprets bytes as Latin-1, not UTF-8).
function isTextContentType(contentType: string) {
  return /^(text\/|application\/json)/.test(contentType);
}
