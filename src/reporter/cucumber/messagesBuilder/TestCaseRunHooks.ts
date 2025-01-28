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
import { Hook, HooksGroup } from './Hook';
import {
  getHooksRootPwStep,
  walkSteps,
  findDeepestStepWith,
  isUnknownDuration,
} from './pwStepUtils';
import { TestCaseRun } from './TestCaseRun';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';

const PW_STEP_CATEGORIES_FOR_HOOKS = ['hook', 'fixture', 'test.step'];

type ExecutedHookInfo = {
  hook: Hook;
  pwStep: pw.TestStep;
};

export function isHookCandidate(pwStep: pw.TestStep) {
  return PW_STEP_CATEGORIES_FOR_HOOKS.includes(pwStep.category);
}

export class TestCaseRunHooks {
  // rootPwStep is empty for skipped test, b/c there are no steps.
  // todo: refactor to avoid "!"
  private rootPwStep!: pw.TestStep;
  private candidates: pw.TestStep[] = [];
  private hookPwSteps = new Set<pw.TestStep>();

  executedHooks = new Map</* internalId */ string, ExecutedHookInfo>();

  static getRootPwStep(result: TestCaseRun, hookType: HooksGroup) {
    return getHooksRootPwStep(result.result, hookType);
  }

  constructor(
    private testCaseRun: TestCaseRun,
    private hookType: HooksGroup,
    private bgRoots: Set<pw.TestStep>,
  ) {}

  private get isAfterHooksType() {
    return this.hookType === 'after';
  }

  fill() {
    this.setRootPwStep();
    // todo: refactor to this early return
    if (!this.rootPwStep) return this;
    this.setCandidates();
    this.addStepsWithName();
    this.addStepWithTimeout();
    this.addStepWithError();
    this.addStepsWithAttachment();
    if (this.isAfterHooksType) {
      this.addUnprocessedErrors();
      this.addUnprocessedAttachments();
    }
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

  private setRootPwStep() {
    // todo: refactor to better handle empty root step (e.g. skipped test)
    this.rootPwStep = getHooksRootPwStep(this.testCaseRun.result, this.hookType)!;
  }

  private setCandidates() {
    // collect steps, not entering into bg roots
    this.candidates = walkSteps(this.rootPwStep, (pwStep) => !this.bgRoots.has(pwStep)).filter(
      (pwStep) => isHookCandidate(pwStep),
    );
  }

  private addStepsWithName() {
    this.candidates
      .filter((pwStep) => pwStep.category === 'test.step' && pwStep.title)
      .forEach((pwStep) => this.hookPwSteps.add(pwStep));
  }

  private addStepWithTimeout() {
    if (!this.testCaseRun.isTimeouted()) return;
    if (this.testCaseRun.timeoutedStep) return;

    // Search timeouted step by duration = -1.
    // This is not 100% method, sometimes timeouted steps have real duration value.
    // But allows to better place timeout error message in report.
    const timeoutedStep = findDeepestStepWith(this.candidates, (pwStep) => {
      return isUnknownDuration(pwStep);
    });
    if (!timeoutedStep) return;

    this.hookPwSteps.add(timeoutedStep);
    this.testCaseRun.registerTimeoutedStep(timeoutedStep);
  }

  private addStepWithError() {
    // In case of several errors in after hooks (as they all run),
    // parent pwStep and test result contain only the last error,
    // but each hook step itself contains own error.
    // Here we find only first step with error.
    // Todo: find and show all errors for after hooks.
    const stepWithError = findDeepestStepWith(this.candidates, (pwStep) => Boolean(pwStep.error));
    if (!stepWithError) return;

    const error = stepWithError.error!;

    // If step is already added to errorSteps, don't register it as hookStep.
    // This is mainly for timeout steps in hooks or bg:
    // They have duration -1 and no 'error' field, but their parent has 'error' field.
    // Here we find this parent again and avoid reporting the error twice.
    if (!this.testCaseRun.hasRegisteredError(error)) {
      this.registerErrorStep(stepWithError, error);
    }
  }

  /**
   * If there are unprocessed errors, attach them to After Hooks root step.
   */
  private addUnprocessedErrors() {
    const unprocessedErrors = this.testCaseRun.getUnprocessedErrors();
    if (unprocessedErrors.length === 0) return;

    const error = buildFallbackError(unprocessedErrors);

    // if there is timeouted step without attached error, attach all unprocessed errors to it,
    // otherwise attach unprocessed error to root 'After Hooks' step.
    const { timeoutedStep } = this.testCaseRun;
    if (timeoutedStep && !this.testCaseRun.getStepError(timeoutedStep)) {
      this.testCaseRun.registerErrorStep(timeoutedStep, error);
    } else {
      this.registerErrorStep(this.rootPwStep, error);
    }
  }

  private addStepsWithAttachment() {
    const { attachmentMapper } = this.testCaseRun;
    this.candidates.forEach((pwStep) => {
      const attachments = attachmentMapper.populateStepAttachments(pwStep, { fromHook: true });
      if (attachments.length > 0) this.hookPwSteps.add(pwStep);
    });
  }

  private addUnprocessedAttachments() {
    const { attachmentMapper } = this.testCaseRun;
    if (attachmentMapper.hasUnprocessedAttachments()) {
      attachmentMapper.mapUnprocessedAttachments(this.rootPwStep);
      this.hookPwSteps.add(this.rootPwStep);
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
}

function buildFallbackError(unprocessedErrors: pw.TestError[]) {
  const firstError = unprocessedErrors[0];

  return firstError && unprocessedErrors.length === 1
    ? firstError
    : buildConcatenatedError(unprocessedErrors);
}

function buildConcatenatedError(errors: pw.TestError[]) {
  const message = errors
    .map((e) => e.message)
    .filter(Boolean)
    .join('\n\n');
  return { message };
}
