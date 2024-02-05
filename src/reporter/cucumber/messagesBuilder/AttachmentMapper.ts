/**
 * Maps test steps with attachments.
 * See: https://github.com/microsoft/playwright/issues/29323
 *
 * Example:
 * onStepBegin fixture: foo
 *   attach a1
 *   onStepBegin test.step bar
 *     attach a2
 *   onStepEnd test.step bar
 *   attach a3
 * onStepEnd fixture: foo
 *
 * Output of this run:
 * fixture: foo -> attachment indexes [0,2]
 * test.step bar -> attachment indexes [1]
 */
import * as pw from '@playwright/test/reporter';
import { MapWithCreate } from '../../../utils/MapWithCreate';
import { MEANINGFUL_STEP_CATEGORIES } from './pwUtils';

type StepAttachmentsInfo = {
  countOnStart: number;
  attachments: pw.TestResult['attachments'];
};

export class AttachmentMapper {
  private usedAttachmentIndexes = new MapWithCreate<pw.TestResult, Set<number>>();
  private stepAttachments = new Map<pw.TestStep, StepAttachmentsInfo>();

  handleStepBegin(result: pw.TestResult, step: pw.TestStep) {
    if (!shouldHandleStep(step)) return;
    this.stepAttachments.set(step, {
      countOnStart: result.attachments.length,
      attachments: [],
    });
  }

  handleStepEnd(result: pw.TestResult, step: pw.TestStep) {
    if (!shouldHandleStep(step)) return;
    const { countOnStart, attachments } = this.getStepAttachmentsInfo(step);
    const usedIndexes = this.usedAttachmentIndexes.getOrCreate(result, () => new Set());
    for (let i = countOnStart; i < result.attachments.length; i++) {
      if (!usedIndexes.has(i)) {
        usedIndexes.add(i);
        attachments.push(result.attachments[i]);
      }
    }
  }

  getStepAttachments(pwStep: pw.TestStep) {
    return shouldHandleStep(pwStep) ? this.getStepAttachmentsInfo(pwStep).attachments : [];
  }

  private getStepAttachmentsInfo(pwStep: pw.TestStep) {
    const stepAttachmentsInfo = this.stepAttachments.get(pwStep);
    if (!stepAttachmentsInfo) {
      throw new Error(`Something went wrong: empty step attachments info`);
    }
    return stepAttachmentsInfo;
  }
}

function shouldHandleStep(pwStep: pw.TestStep) {
  return MEANINGFUL_STEP_CATEGORIES.includes(pwStep.category);
}
