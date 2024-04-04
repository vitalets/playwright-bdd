/**
 * Executed hooks of test run.
 */
import * as pw from '@playwright/test/reporter';
import { Hook, HookType } from './Hook';
import {
  getHooksRootPwStep,
  collectStepsDfs,
  findDeepestStepWithError,
  findDeepestStepWithUnknownDuration,
} from './pwStepUtils';
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
    this.addStepWithError();
    this.addStepWithTimeout();
    this.addStepsWithAttachment();
    this.excludeMainSteps(mainSteps);
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
        // it means that this hook comes from another attempt of this test case.
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
      this.testCaseRun.registerErrorStep(stepWithError);
      this.testCaseRun.registerTimeoutedStep(stepWithError);
    }
  }

  private addStepWithTimeout() {
    if (!this.testCaseRun.isTimeouted()) return;
    if (this.testCaseRun.timeoutedStep) return;
    const timeoutedStep =
      this.hookType === 'before'
        ? // Timeouted steps have duration = -1 in PW <= 1.39 and no error field.
          // In PW > 1.39 timeouted steps have '.error' populated
          findDeepestStepWithUnknownDuration(this.rootPwStep)
        : // Timeouted after hooks don't have duration = -1,
          // so there is no way to find which exactly fixture timed out.
          // We mark root 'After Hooks' step as timeouted.
          this.rootPwStep;
    if (timeoutedStep) {
      this.hookSteps.add(timeoutedStep);
      this.testCaseRun.timeoutedStep = timeoutedStep;
    }
  }

  private excludeMainSteps(mainSteps: ExecutedStepInfo[]) {
    // - exclude background steps, b/c they are in pickle and should not in hooks.
    // - exclude other test.step items that are bdd steps and should not be in hooks.
    // Important to run this fn after this.fillExecutedSteps()
    // as we assume steps are already populated
    mainSteps.forEach((stepInfo) => {
      if (stepInfo.pwStep) {
        this.hookSteps.delete(stepInfo.pwStep);
      }
    });
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
