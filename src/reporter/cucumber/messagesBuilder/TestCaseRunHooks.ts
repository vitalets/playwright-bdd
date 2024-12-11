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
  private timeoutedStep?: pw.TestStep;
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
    this.addStepWithErrorFallback();
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

  private addStepWithTimeout() {
    if (!this.testCaseRun.isTimeouted()) return;
    if (this.testCaseRun.timeoutedStep) return;

    // Search timeouted step by duration = -1.
    // This is not 100% method, sometimes timeouted steps have real duration value.
    // But allows to better place timeout error message in report.
    const timeoutedStep = findDeepestStepWithUnknownDuration(this.rootPwStep);
    if (!timeoutedStep) return;

    this.timeoutedStep = timeoutedStep;
    this.hookSteps.add(timeoutedStep);
    this.testCaseRun.timeoutedStep = timeoutedStep;

    if (timeoutedStep.error) {
      this.registerErrorStep(timeoutedStep, timeoutedStep.error);
    }
  }

  private addStepWithError() {
    // In case of several errors in after hooks (as they all run),
    // parent pwStep and test result contain only the last error,
    // but each hook step itself contains own error.
    // Here we find only first step with error.
    // Todo: find and show all errors for after hooks.
    const stepWithError = findDeepestStepWithError(this.rootPwStep);
    if (!stepWithError) return;

    // Handling timeout in Before hook:
    // - timeout step has duration -1 and no 'error' field
    // - timeout step parent has 'error' field with timeout error
    // We move error from parent to timeout step and don't save parent as error step.
    if (
      this.timeoutedStep &&
      !this.timeoutedStep.error &&
      this.timeoutedStep.parent === stepWithError
    ) {
      this.registerErrorStep(this.timeoutedStep, stepWithError.error);
      return;
    }

    this.registerErrorStep(stepWithError, stepWithError.error);
  }

  // eslint-disable-next-line visual/complexity
  private addStepWithErrorFallback() {
    // if in 'after' hooks group there are unprocessed errors,
    // attach them to After Hooks root step.
    if (this.hookType !== 'after') return;

    const unprocessedErrors = this.testCaseRun.getUnprocessedErrors();
    if (unprocessedErrors.length === 0) return;

    const error = buildFallbackError(unprocessedErrors);

    // if there is timeouted step without attached error, attach all unprocessed errors to it,
    // otherwise attach unprocessed error to root 'After Hooks' step.
    const { timeoutedStep } = this.testCaseRun;
    if (timeoutedStep && !this.testCaseRun.getStepError(timeoutedStep)) {
      this.testCaseRun.registerErrorStep(timeoutedStep, error);
    } else if (this.rootPwStep) {
      this.registerErrorStep(this.rootPwStep, error);
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
      const hook = this.getOrRegisterHook(pwStep);
      this.executedHooks.set(internalId, { hook, pwStep });
    });
  }

  private getOrRegisterHook(pwStep: pw.TestStep) {
    const internalId = Hook.getInternalId(pwStep);
    return this.testCaseRun.hooks.getOrCreate(
      internalId,
      () => new Hook(internalId, this.hookType, pwStep),
    );
  }

  private registerErrorStep(pwStep: pw.TestStep, error: pw.TestError) {
    this.hookSteps.add(pwStep);
    this.testCaseRun.registerErrorStep(pwStep, error);
  }
}

function buildFallbackError(unprocessedErrors: pw.TestError[]) {
  return unprocessedErrors.length === 1
    ? unprocessedErrors[0]
    : buildConcatenatedError(unprocessedErrors);
}

function buildConcatenatedError(errors: pw.TestError[]) {
  const message = errors
    .map((e) => e.message)
    .filter(Boolean)
    .join('\n\n');
  return { message };
}
