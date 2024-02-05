/**
 * Executed hooks of test run.
 */
import * as pw from '@playwright/test/reporter';
import { Hook, HookType } from './Hook';
import {
  MEANINGFUL_STEP_CATEGORIES,
  findDeepestErrorStep,
  getHooksRootStep,
  getPlaywrightStepsWithCategories,
} from './pwUtils';
import { ExecutedStepInfo, TestCaseRun } from './TestCaseRun';
import { BDD_DATA_ATTACHMENT_NAME } from '../../../run/attachments/BddData';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';

type ExecutedHookInfo = {
  hook: Hook;
  pwStep: pw.TestStep;
};

export class TestCaseRunHooks {
  private rootStep?: pw.TestStep;
  private hookSteps = new Set<pw.TestStep>();
  executedHooks = new Map</* internalId */ string, ExecutedHookInfo>();

  constructor(
    private testCaseRun: TestCaseRun,
    private hookType: HookType,
  ) {
    this.rootStep = getHooksRootStep(this.testCaseRun.result, hookType);
  }

  fill(mainSteps: ExecutedStepInfo[]) {
    this.addStepsWithName();
    this.addStepsWithAttachment();
    this.addStepWithError();
    this.excludeBackgroundSteps(mainSteps);
    this.createHooksInfo();
  }

  buildMessages() {
    const messages: TestStepRunEnvelope[] = [];
    this.testCaseRun
      .getTestCase()
      .getHooks(this.hookType)
      .forEach((hookInfo) => {
        const executedHook = this.executedHooks.get(hookInfo.hook.internalId);
        // todo: if pwStep is not found in this.executedBeforeHooks,
        // it means that this hook comes from another run of this test case.
        // We can stil try to find it in test result, as otherwise it will be marked as skipped,
        // but actually it was executed.
        const testStepRun = new TestStepRun(
          this.testCaseRun,
          hookInfo.testStep,
          executedHook?.pwStep,
        );
        messages.push(...testStepRun.buildMessages());
      });

    return messages;
  }

  private addStepsWithName() {
    getPlaywrightStepsWithCategories(this.rootStep, ['test.step'])
      .filter((pwStep) => Boolean(pwStep.title))
      .forEach((pwStep) => this.hookSteps.add(pwStep));
  }

  private addStepsWithAttachment() {
    const candidates = getPlaywrightStepsWithCategories(this.rootStep, MEANINGFUL_STEP_CATEGORIES);
    // add rootStep itself as it can contain screenshot
    if (this.rootStep) candidates.push(this.rootStep);
    candidates
      .filter((pwStep) => this.hasAttachments(pwStep))
      .forEach((pwStep) => this.hookSteps.add(pwStep));
  }

  private addStepWithError() {
    const stepWithError = findDeepestErrorStep(this.rootStep);
    if (stepWithError) {
      this.hookSteps.add(stepWithError);
      // in Playwright error is inherited by all parent steps,
      // but we wnat to show it once
      this.hookSteps.forEach((step) => {
        if (step !== stepWithError) delete step.error;
      });
    }
  }

  private excludeBackgroundSteps(mainSteps: ExecutedStepInfo[]) {
    // exclude background steps, b/c they are in pickle, not in hooks.
    // Important to run this fn after this.fillExecutedSteps()
    // as we assume steps are already populated
    if (this.hookType === 'before') {
      mainSteps.forEach((stepInfo) => this.hookSteps.delete(stepInfo.pwStep));
    }
  }

  private createHooksInfo() {
    this.hookSteps.forEach((pwStep) => {
      const internalId = Hook.getInternalId(pwStep);
      const hook = this.testCaseRun.hooks.getOrCreate(
        internalId,
        () => new Hook(internalId, pwStep),
      );
      this.executedHooks.set(internalId, { hook, pwStep });
    });
  }

  private hasAttachments(pwStep: pw.TestStep) {
    return (
      this.testCaseRun.attachmentMapper
        .getStepAttachments(pwStep)
        .filter((a) => a.name !== BDD_DATA_ATTACHMENT_NAME).length > 0
    );
  }
}
