/**
 * Executed hooks of test run.
 */
import * as pw from '@playwright/test/reporter';
import { Hook, HookType } from './Hook';
import {
  getHooksRootPwStep,
  collectStepsDfs,
  findDeepestStepWithError,
  findDeepestStepWithTimeout,
} from './pwUtils';
import { ExecutedStepInfo, TestCaseRun } from './TestCaseRun';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';

type ExecutedHookInfo = {
  hook: Hook;
  pwStep: pw.TestStep;
};

export class TestCaseRunHooks {
  private rootPwStep?: pw.TestStep;
  private candidateSteps: pw.TestStep[] = [];
  private hookSteps = new Set<pw.TestStep>();
  executedHooks = new Map</* internalId */ string, ExecutedHookInfo>();

  constructor(
    private testCaseRun: TestCaseRun,
    private hookType: HookType,
  ) {}

  fill(mainSteps: ExecutedStepInfo[]) {
    this.setRootStep();
    this.setCandidateSteps();
    this.addStepsWithName();
    this.addStepWithTimeout();
    this.addStepWithError();
    this.addStepsWithAttachment();
    this.excludeBackgroundSteps(mainSteps);
    this.setExecutedHooks();
    return this;
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

  private setRootStep() {
    this.rootPwStep = getHooksRootPwStep(this.testCaseRun.result, this.hookType);
  }

  private setCandidateSteps() {
    if (this.rootPwStep) this.candidateSteps.push(this.rootPwStep);
    this.candidateSteps.push(...collectStepsDfs(this.rootPwStep));
  }

  private addStepsWithName() {
    this.candidateSteps.forEach((pwStep) => {
      if (pwStep.category === 'test.step' && pwStep.title) {
        this.hookSteps.add(pwStep);
      }
    });
  }

  private addStepsWithAttachment() {
    const { attachmentMapper } = this.testCaseRun;
    this.candidateSteps.forEach((pwStep) => {
      if (attachmentMapper.getStepAttachments(pwStep).length > 0) {
        this.hookSteps.add(pwStep);
      }
    });
  }

  private addStepWithError() {
    const stepWithError = findDeepestStepWithError(this.rootPwStep);
    if (stepWithError) {
      this.hookSteps.add(stepWithError);
      // in Playwright error is inherited by all parent steps,
      // but we want to show it once (in the deepest step)
      this.testCaseRun.errorSteps.add(stepWithError);
    }
  }

  private addStepWithTimeout() {
    if (!this.testCaseRun.isTimeouted()) return;
    if (this.testCaseRun.timeoutedStep) return;
    if (this.hookType === 'before') {
      const timeoutedStep = findDeepestStepWithTimeout(this.rootPwStep);
      if (timeoutedStep) {
        this.hookSteps.add(timeoutedStep);
        this.testCaseRun.timeoutedStep = timeoutedStep;
      }
    } else {
      // timeouted after hooks don't have duration = -1
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

  private setExecutedHooks() {
    this.hookSteps.forEach((pwStep) => {
      const internalId = Hook.getInternalId(pwStep);
      const hook = this.testCaseRun.hooks.getOrCreate(
        internalId,
        () => new Hook(internalId, pwStep),
      );
      this.executedHooks.set(internalId, { hook, pwStep });
    });
  }
}
