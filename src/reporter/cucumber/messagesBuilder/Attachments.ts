/**
 * Class for getting attachments for a particular step.
 *
 * The main problem is that in Cucumber attachments are linked to the step,
 * but in Playwright attachments are linked to the whole test.
 *
 * How mapping is done now:
 * 1. for the particular step we find all sub-steps with category = 'attach'
 * 2. from these sub-step titles we extract attachment names
 * 3. find first entries with such names in result.attachments
 * 4. remove used entries from result.attachments
 * See also: https://github.com/microsoft/playwright/issues/29323
 *
 * Automatic Playwright screenshots for failed tests:
 * - if error is in main steps or in fixture before call of use():
 *   * screenshot attachment is a normal attachment named 'screenshot'
 *   * coresponding step with category: 'attach' is in 'After Hooks' step (since pw 1.35)
 *
 * - if error is in fixtures after call of use():
 *   Screenshot attachment is NOT in result.attachments, there is no step with category: 'attach'.
 *   There is root step with category: 'pw:api' and title: 'page.screenshot'.
 *   It is known bug of Playwright: https://github.com/microsoft/playwright/issues/29325
 */
import fs from 'node:fs';
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { isGeneratedAttachmentName } from '../../../run/AttachmentAdapter';
import { TestCaseRun } from './TestCaseRun';

type PwAttachment = pw.TestResult['attachments'][0];

export class Attachments {
  private attachments: PwAttachment[] = [];

  constructor(private testCaseRun: TestCaseRun) {
    this.attachments = this.testCaseRun.result.attachments.slice();
  }

  buildMessages(testStep: messages.TestStep, pwStep?: pw.TestStep) {
    if (!pwStep) return [];
    return this.extractStepAttachments(pwStep)
      .filter((pwAttachment) => pwAttachment.name !== '__bddData')
      .map((pwAttachment) => {
        const attachment: messages.Attachment = {
          testCaseStartedId: this.testCaseRun.id,
          testStepId: testStep.id,
          // for now always attach as base64
          // todo: for text/plain and application/json use raw to save some bytes
          body: this.getAttachmentBodyBase64(pwAttachment),
          contentEncoding: messages.AttachmentContentEncoding.BASE64,
          mediaType: pwAttachment.contentType,
          fileName: isGeneratedAttachmentName(pwAttachment) ? undefined : pwAttachment.name,
        };

        return { attachment };
      });
  }

  private extractStepAttachments(pwStep: pw.TestStep) {
    const attachmentSteps = pwStep.steps.filter((step) => step.category === 'attach');
    return attachmentSteps.map((attachmentStep) => {
      // todo: use more reliable way to map attachments with steps
      // see: https://github.com/microsoft/playwright/issues/29323
      const index = this.attachments.findIndex(
        (a) => getAttachmentStepName(a.name) === attachmentStep.title,
      );
      if (index === -1) {
        throw new Error(`Attachment not found: ${attachmentStep.title}, step: ${pwStep.title}`);
      }
      const attachment = this.attachments[index];
      this.attachments.splice(index, 1);
      return attachment;
    });
  }

  private getAttachmentBodyBase64(pwAttachment: { path?: string; body?: Buffer }) {
    return pwAttachment.path
      ? fs.readFileSync(pwAttachment.path, 'base64')
      : pwAttachment.body!.toString('base64');
  }
}

/**
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L409
 */
export function getAttachmentStepName(attachmentName: string) {
  return `attach "${attachmentName}"`;
}
