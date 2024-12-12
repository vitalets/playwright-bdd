/**
 * Maps attachments to test steps.
 *
 * As there is no built-in method to map attachments with steps,
 * I've considered several approaches:
 *
 * 1. Track attachments count in onStepBegin/onStepEnd.
 * + intuitive and simple
 * - does not work in merge-reports, there attachments are populated only in onTestEnd.
 * See: https://github.com/microsoft/playwright/issues/29323
 *
 * 2. Track attachments manually in own code and store attachment indexes
 * for each step in __bddData system attachment.
 * + works in merge-reports
 * - impossible to map attachments in user's custom fixtures, as we don't wrap this code
 *
 * 3. Check Playwright steps with category: 'attach', extract attachment names and
 * map to attachments using names and order.
 * + works in merge-reports
 * + allows to map attachments in custom fixtures
 * - needs Playwright >= 1.34
 *
 * This class implements approach 3.
 *
 * Example:
 *
 * Code:
 * // fixture that creates 3 attachments
 * myFixture: ({}, use, testInfo) => {
 *   await testInfo.attach('my attachment', { body: 'foo' });
 *   await test.step('my step', async () => {
 *     await testInfo.attach('my attachment', { body: 'bar' })
 *   });
 *   await testInfo.attach('my attachment', { body: 'baz' });
 * }
 *
 * Attachments:
 *  my attachment, body = foo
 *  my attachment, body = bar
 *  my attachment, body = baz
 *
 * Steps tree:
 * - fixture: myFixture
 *   - attach "my attachment"
 *   - my step
 *     - attach "my attachment"
 *   - attach "my attachment"
 *
 * Algorithm:
 * 1. find all steps with category: 'attach' using deep-first search traversal
 * 2. iterate these steps in the following manner:
 *   2.1 take step and extract attachment name from step title
 *   2.2 find this attachment by name in result.attachments, searching from the beginning of array
 *   2.3 map found attachment with step.parent
 *   2.4 remove found attachment from attachments array
 */
import * as pw from '@playwright/test/reporter';
import { AutofillMap } from '../../../utils/AutofillMap.js';
import { findAllStepsWithCategory, getHooksRootPwStep } from './pwStepUtils';
import { PwAttachment } from '../../../playwright/types.js';
import { stripAnsiEscapes } from '../../../utils/stripAnsiEscapes.js';

export class AttachmentMapper {
  private stepAttachments = new AutofillMap<pw.TestStep, PwAttachment[]>();
  private unusedAttachments: PwAttachment[] = [];

  constructor(private result: pw.TestResult) {
    this.mapAttachments();
    this.mapUnusedAttachments();
    this.mapStdioAttachments('stdout');
    this.mapStdioAttachments('stderr');
  }

  getStepAttachments(pwStep: pw.TestStep) {
    return this.stepAttachments.get(pwStep) || [];
  }

  private mapAttachments() {
    const allAttachments = this.result.attachments.slice();
    const allAttachmentSteps = findAllStepsWithCategory(this.result, 'attach');
    allAttachmentSteps
      // filter out trace/screenshot/video to always show them at the scenario bottom (and not in bg)
      .filter((attachmentStep) => !isPlaywrightAutoAttachment(attachmentStep))
      .forEach((attachmentStep) => this.mapAttachment(attachmentStep, allAttachments));
    this.unusedAttachments.push(...allAttachments);
  }

  private mapAttachment(attachmentStep: pw.TestStep, allAttachments: PwAttachment[]) {
    const index = allAttachments.findIndex(
      (a) => getAttachmentStepTitle(a.name) === attachmentStep.title,
    );
    if (index === -1) {
      throw new Error(`Attachment not found for step: ${attachmentStep.title}`);
    }

    // pick attachment from result.attachments array
    const [foundAttachment] = allAttachments.splice(index, 1);

    const parentStep = attachmentStep.parent;
    const stepAttachments = parentStep
      ? this.stepAttachments.getOrCreate(parentStep, () => [])
      : this.unusedAttachments;

    stepAttachments.push(foundAttachment);
  }

  private mapUnusedAttachments() {
    if (!this.unusedAttachments.length) return;
    // map unused attachments to the 'After Hooks' step
    const afterHooksRoot = this.getAfterHooksRoot();
    const stepAttachments = this.stepAttachments.getOrCreate(afterHooksRoot, () => []);
    stepAttachments.push(...this.unusedAttachments);
  }

  private mapStdioAttachments(name: 'stdout' | 'stderr') {
    // map stdout / stderr to the 'After Hooks' step
    if (!this.result[name]?.length) return;
    const body = this.result[name]
      .map((s) => (typeof s === 'string' ? stripAnsiEscapes(s) : s))
      .join('');
    const afterHooksRoot = this.getAfterHooksRoot();
    const stepAttachments = this.stepAttachments.getOrCreate(afterHooksRoot, () => []);
    stepAttachments.push({
      name,
      // Attach stdout / stderr as text/x.cucumber.log+plain instead of text/plain,
      // because Cucumber HTML report has pretty formatting for that.
      // See: https://github.com/vitalets/playwright-bdd/issues/239#issuecomment-2451423020
      contentType: 'text/x.cucumber.log+plain',
      body: Buffer.from(body),
    });
  }

  private getAfterHooksRoot() {
    const afterHooksRoot = getHooksRootPwStep(this.result, 'after');
    if (!afterHooksRoot) {
      throw new Error(`Can not find after hooks root.`);
    }
    return afterHooksRoot;
  }
}

// See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L413
function getAttachmentStepTitle(attachmentName: string) {
  return `attach "${attachmentName}"`;
}

function isPlaywrightAutoAttachment(attachmentStep: pw.TestStep) {
  return /^attach "(trace|screenshot|video)"$/.test(attachmentStep.title);
}
