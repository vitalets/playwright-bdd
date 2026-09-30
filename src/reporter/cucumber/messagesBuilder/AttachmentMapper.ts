/**
 * Maps visible result attachments to test steps and hooks using step.attachments.
 * Traverses nested steps and matches attachments by reference, so duplicate names
 * and merged reports preserve ownership. Hook traversal stops at nested hooks.
 * Assigned attachments are removed from the pending list; remaining attachments,
 * including stdout/stderr, are mapped when mapUnprocessedAttachments is called.
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

    this.populateByAttachmentsField(pwStep, nestedSteps);

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
      .flatMap((pwStep) => pwStep.attachments)
      .forEach((attachment) => {
        // Items in step.attachments are referentially equal to result.attachments:
        // See: https://github.com/microsoft/playwright/pull/34037/files#diff-a99c58caa6261e2a4ea9b74b160d863e627fcb76f171c7bada90eb2065fa6af6R708
        const index = this.allAttachments.indexOf(attachment);
        if (index >= 0) this.assignAttachment(index, pwStep);
      });
  }

  private assignAttachment(index: number, pwStep: pw.TestStep) {
    // pick attachment from result.attachments array
    const [foundAttachment] = this.allAttachments.splice(index, 1);
    this.stepAttachments.getOrCreate(pwStep, () => []).push(foundAttachment!);
  }
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
