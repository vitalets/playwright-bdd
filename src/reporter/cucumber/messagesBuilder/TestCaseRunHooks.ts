/**
 * Executed hooks of test run.
 *
 * In Playwright:
 * worker-level hooks (BeforeAll / AfterAll) are still part of
 * particular test results. E.g. BeforeAll is reported as a step of the first test in a worker.
 *
 * In Cucumber:
 * Worker-level hooks are not considered to be a part of any test case.
 * They will be reported as separate messages TestRunHookStarted / TestRunHookFinished.
 * See: https://github.com/cucumber/messages/pull/102
 *
 * In playwright-bdd:
 * As of now, we don't emit TestRunHookStarted / TestRunHookFinished messages,
 * but include worker-level hooks into testCase steps.
 * This could be changed in the future, when cucumber-js will add it.
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
    this.addStepWithTimeout();
    this.addStepWithError();
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
        // We can still try to find it in test result, as otherwise it will be marked as skipped,
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
    if (!stepWithError) return;
    // if this step is a parent of timeouted step, omit it
    // to not show the same error
    const { timeoutedStep } = this.testCaseRun;
    if (this.hookType === 'before' && timeoutedStep?.parent === stepWithError) return;

    this.hookSteps.add(stepWithError);
    // in Playwright error is inherited by all parent steps,
    // but we want to show it once (in the deepest step)
    this.testCaseRun.collectErrorStep(stepWithError);
    // this.testCaseRun.handleTimeoutedStep(stepWithError);
  }

  private addStepWithTimeout() {
    if (!this.testCaseRun.isTimeouted()) return;
    if (this.testCaseRun.timeoutedStep) return;
    const timeoutedStep =
      this.hookType === 'before'
        ? // Timeouted before hook:
          // - has duration = -1
          // - 'error' field in all parent steps
          findDeepestStepWithUnknownDuration(this.rootPwStep)
        : // Timeouted after hook:
          // - does not have duration = -1
          // - no 'error' field in steps, 'error' field is only in test result
          // So there is no way to find which exactly fixture timed out.
          // We mark root 'After Hooks' step as timeouted.
          this.rootPwStep;
    if (timeoutedStep) {
      this.hookSteps.add(timeoutedStep);
      this.testCaseRun.timeoutedStep = timeoutedStep;
    }
  }

  private excludeMainSteps(mainSteps: ExecutedStepInfo[]) {
    // - exclude background steps, b/c they are in pickle and should not be in hooks.
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
        () => new Hook(internalId, this.hookType, pwStep),
      );
      this.executedHooks.set(internalId, { hook, pwStep });
    });
  }
}
