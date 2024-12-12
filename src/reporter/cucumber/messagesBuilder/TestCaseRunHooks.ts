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
  findDeepestStepWithError,
  findDeepestStepWithUnknownDuration,
  findAllStepsWith,
} from './pwStepUtils';
import { TestCaseRun } from './TestCaseRun';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';

type ExecutedHookInfo = {
  hook: Hook;
  pwStep: pw.TestStep;
};

export class TestCaseRunHooks {
  private rootPwStep?: pw.TestStep;
  private hookPwSteps = new Set<pw.TestStep>();
  executedHooks = new Map</* internalId */ string, ExecutedHookInfo>();

  constructor(
    private testCaseRun: TestCaseRun,
    private hookType: HookType,
    private bgSteps: Set<pw.TestStep>,
  ) {}

  fill() {
    this.setRootStep();
    this.addStepsWithName();
    this.addStepWithTimeout();
    this.addStepWithError();
    this.addStepWithErrorFallback();
    this.addStepsWithAttachment();
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

  private addStepsWithName() {
    if (!this.rootPwStep) return;

    const stepsWithName = findAllStepsWith(this.rootPwStep, (pwStep) => {
      return pwStep.category === 'test.step' && pwStep.title;
    });

    stepsWithName
      .filter((pwStep) => !this.isBackgroundStep(pwStep))
      .forEach((pwStep) => this.hookPwSteps.add(pwStep));
  }

  private addStepsWithAttachment() {
    if (!this.rootPwStep) return;

    const { attachmentMapper } = this.testCaseRun;
    const stepsWithAttachment = findAllStepsWith(this.rootPwStep, (pwStep) => {
      return attachmentMapper.getStepAttachments(pwStep).length > 0;
    });

    stepsWithAttachment
      .filter((pwStep) => !this.isBackgroundStep(pwStep))
      .forEach((pwStep) => this.hookPwSteps.add(pwStep));
  }

  private addStepWithTimeout() {
    if (!this.testCaseRun.isTimeouted()) return;
    if (this.testCaseRun.timeoutedStep) return;

    // Search timeouted step by duration = -1.
    // This is not 100% method, sometimes timeouted steps have real duration value.
    // But allows to better place timeout error message in report.
    const timeoutedStep = findDeepestStepWithUnknownDuration(this.rootPwStep);
    if (!timeoutedStep || this.isBackgroundStep(timeoutedStep)) return;

    this.hookPwSteps.add(timeoutedStep);
    this.testCaseRun.registerTimeoutedStep(timeoutedStep);
  }

  private addStepWithError() {
    // In case of several errors in after hooks (as they all run),
    // parent pwStep and test result contain only the last error,
    // but each hook step itself contains own error.
    // Here we find only first step with error.
    // Todo: find and show all errors for after hooks.
    const stepWithError = findDeepestStepWithError(this.rootPwStep);
    if (!stepWithError || this.isBackgroundStep(stepWithError)) return;

    // If step is already added to errorSteps, don't register it as hookStep.
    // This is mainly for timeout steps in hooks or bg:
    // They have duration -1 and no 'error' field, but their parent has 'error' field.
    // Here we find this parent again and avoid reporting the error twice.
    if (!this.testCaseRun.hasRegisteredError(stepWithError.error)) {
      this.registerErrorStep(stepWithError, stepWithError.error);
    }
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

  private setExecutedHooks() {
    this.hookPwSteps.forEach((pwStep) => {
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
    this.hookPwSteps.add(pwStep);
    this.testCaseRun.registerErrorStep(pwStep, error);
  }

  private isBackgroundStep(pwStep: pw.TestStep) {
    return this.bgSteps.has(pwStep);
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
