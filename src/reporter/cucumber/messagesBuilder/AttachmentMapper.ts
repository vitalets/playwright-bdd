/**
 * Maps attachments to test steps.
 *
 * UPDATE:
 * Since pw 1.50 each step has 'attahcments' field.
 * See: https://playwright.dev/docs/next/api/class-teststep#test-step-attachments
 * See: https://github.com/microsoft/playwright/pull/34037
 * Items in step.attachments are referencially equal to result.attachments:
 * See: https://github.com/microsoft/playwright/pull/34037/files#diff-a99c58caa6261e2a4ea9b74b160d863e627fcb76f171c7bada90eb2065fa6af6R708
 * So this module could compare attachments by reference.
 * Note that 'testInfo.attach()' and 'testInfo.attachments.push()' behave differently:
 * - testInfo.attach() creates extra step with category: 'attach' and puts attachment inside
 * - testInfo.attachments.push() puts attachment directly to step.attachments
 *
 * PREVIOUS:
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
import { walkSteps } from './pwStepUtils';
import { PwAttachment } from '../../../playwright/types.js';
import { stripAnsiEscapes } from '../../../utils/stripAnsiEscapes.js';
import { toBoolean } from '../../../utils';
import { isHookCandidate } from './TestCaseRunHooks';

export class AttachmentMapper {
  private allAttachments: PwAttachment[];
  private stepAttachments = new AutofillMap<pw.TestStep, PwAttachment[]>();

  constructor(private result: pw.TestResult) {
    // Playwright hides "_" prefixed attachments, we do the same.
    // See: https://github.com/microsoft/playwright/pull/35044
    const visibleAttachments = this.result.attachments.filter((a) => !a.name.startsWith('_'));

    this.allAttachments = [
      ...visibleAttachments, // prettier-ignore
      ...this.getStdioAttachments(),
    ];
  }

  private getStdioAttachments() {
    return [
      stdioAsAttachment(this.result, 'stdout'),
      stdioAsAttachment(this.result, 'stderr'),
    ].filter(toBoolean);
  }

  getStepAttachments(pwStep: pw.TestStep) {
    return this.stepAttachments.get(pwStep) || [];
  }

  populateStepAttachments(pwStep: pw.TestStep, { fromHook = false } = {}) {
    this.stepAttachments.set(pwStep, []);

    const nestedSteps = fromHook
      ? [
          pwStep,
          // for hooks stop on nested potential hook candidates, as they show attachments themselves
          // bg steps will be also filtered out
          ...walkSteps(pwStep.steps, (pwStep) => !isHookCandidate(pwStep)),
        ]
      : walkSteps(pwStep);

    if ('attachments' in pwStep) {
      this.populateByAttachmentsField(pwStep, nestedSteps);
    } else {
      this.populateByAttachCategory(pwStep, nestedSteps);
    }

    return this.getStepAttachments(pwStep);
  }

  hasUnprocessedAttachments() {
    return this.allAttachments.length > 0;
  }

  mapUnprocessedAttachments(pwStep: pw.TestStep) {
    const existingAttachments = this.getStepAttachments(pwStep);
    const newAttachments = existingAttachments.concat(this.allAttachments);
    this.stepAttachments.set(pwStep, newAttachments);
    this.allAttachments.length = 0;
  }

  private populateByAttachmentsField(pwStep: pw.TestStep, nestedSteps: pw.TestStep[]) {
    nestedSteps
      // Since PW 1.50 tere is 'step.attachments' field
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .map((pwStep) => pwStep.attachments || [])
      .flat()
      .forEach((attachment) => {
        // Items in step.attachments are referencially equal to result.attachments:
        // See: https://github.com/microsoft/playwright/pull/34037/files#diff-a99c58caa6261e2a4ea9b74b160d863e627fcb76f171c7bada90eb2065fa6af6R708
        const index = this.allAttachments.indexOf(attachment);
        if (index >= 0) this.assignAttachment(index, pwStep);
      });
  }

  private populateByAttachCategory(pwStep: pw.TestStep, nestedSteps: pw.TestStep[]) {
    nestedSteps
      .filter((pwStep) => pwStep.category === 'attach')
      // filter out trace/screenshot/video to always show them at the scenario bottom (and not in bg)
      .filter((attachmentStep) => !isPlaywrightAutoAttachment(attachmentStep))
      .forEach((attachmentStep) => {
        const index = findAttachmentIndexByAttachmentStep(this.allAttachments, attachmentStep);
        if (index >= 0) this.assignAttachment(index, pwStep);
      });
  }

  // private mapAttachments() {
  //   // const allAttachmentSteps = findAllStepsWithCategory(this.result, 'attach');
  //   allAttachmentSteps
  //     // filter out trace/screenshot/video to always show them at the scenario bottom (and not in bg)
  //     .filter((attachmentStep) => !isPlaywrightAutoAttachment(attachmentStep))
  //     .forEach((attachmentStep) => this.handleAttachmentStep(attachmentStep));
  //   // this.unusedAttachments.push(...this.allAttachments);
  // }

  // private handleAttachmentStep(attachmentStep: pw.TestStep) {
  //   const parentStep = attachmentStep.parent;

  //   // Since PW 1.50 handle parent BDD step 'attachments' field (once)
  //   if (parentStep && !this.stepAttachments.has(parentStep)) {
  //     this.handleBddStep(parentStep);
  //   }

  //   const index = findAttachmentIndexByAttachmentStep(this.allAttachments, attachmentStep);
  //   if (index === -1) {
  //     throw new Error(`Attachment not found for step: ${attachmentStep.title}`);
  //   }

  //   this.assignAttachment(index, parentStep);
  // }

  private assignAttachment(index: number, pwStep: pw.TestStep) {
    // pick attachment from result.attachments array
    const [foundAttachment] = this.allAttachments.splice(index, 1);
    this.stepAttachments.getOrCreate(pwStep, () => []).push(foundAttachment!);
  }

  // private mapUnusedAttachments() {
  //   if (!this.unusedAttachments.length) return;
  //   // map unused attachments to the 'After Hooks' step
  //   const afterHooksRoot = this.getAfterHooksRoot();
  //   const stepAttachments = this.stepAttachments.getOrCreate(afterHooksRoot, () => []);
  //   stepAttachments.push(...this.unusedAttachments);
  // }
}

function findAttachmentIndexByAttachmentStep(
  allAttachments: PwAttachment[],
  attachmentStep: pw.TestStep,
) {
  return allAttachments.findIndex((a) => getAttachmentStepTitle(a.name) === attachmentStep.title);
}

// See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L413
function getAttachmentStepTitle(attachmentName: string) {
  return `attach "${attachmentName}"`;
}

function isPlaywrightAutoAttachment(attachmentStep: pw.TestStep) {
  return /^attach "(trace|screenshot|video)"$/.test(attachmentStep.title);
}

function stdioAsAttachment(result: pw.TestResult, name: 'stdout' | 'stderr') {
  if (!result[name]?.length) return;

  const body = result[name]
    // data can be buffer
    .map((data) => (typeof data === 'string' ? data : data?.toString('utf8')))
    .filter(Boolean)
    .map((str) => stripAnsiEscapes(str))
    .join('');

  return {
    name,
    // Attach stdout / stderr as text/x.cucumber.log+plain instead of text/plain,
    // because Cucumber HTML report has pretty formatting for that.
    // See: https://github.com/vitalets/playwright-bdd/issues/239#issuecomment-2451423020
    contentType: 'text/x.cucumber.log+plain',
    body: Buffer.from(body),
  };
}
