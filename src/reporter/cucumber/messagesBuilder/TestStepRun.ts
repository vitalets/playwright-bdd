/**
 * Class representing run of a test step.
 *
 * Each step has 4 related entities:
 * 1. pickle step -> how it is defined in Gherkin
 * 2. pwStep -> TestStep in Playwright test results (will be missing, if step didn't run)
 * 3. bddDataStep -> step info from bddData attachment (will be missing if step didn't run)
 * 4. messages.TestStep -> step info as a Cucumber message inside Cucumber's TestCase
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { toCucumberTimestamp } from './timing';
import { TestStepAttachments } from './TestStepAttachments';
import { isSkippedError } from './pwStepUtils';
import { buildErrorMessage, buildException } from './error';

export type TestStepRunEnvelope = Pick<
  messages.Envelope,
  | 'testStepStarted' // prettier-ignore
  | 'testStepFinished'
  | 'attachment'
>;

/**
 * Run of messages.TestStep from hook or scenario.
 */
export class TestStepRun {
  constructor(
    protected testCaseRun: TestCaseRun,
    protected testStep: messages.TestStep,
    protected pwStep: pw.TestStep | undefined,
  ) {}

  buildMessages(): TestStepRunEnvelope[] {
    const stepAttachments = new TestStepAttachments(this.testCaseRun, this.testStep, this.pwStep);
    return [
      this.buildTestStepStarted(), // prettier-ignore
      ...stepAttachments.buildMessages(),
      this.buildTestStepFinished(),
    ];
  }

  private isHook() {
    return Boolean(this.testStep.hookId);
  }

  private wasExecuted(): this is { pwStep: pw.TestStep } {
    return Boolean(this.pwStep);
  }

  private get startTime() {
    return this.wasExecuted() ? this.pwStep.startTime : this.testCaseRun.result.startTime;
  }

  private get duration() {
    return this.wasExecuted() ? this.pwStep.duration : 0;
  }

  private buildTestStepStarted() {
    const testStepStarted: messages.TestStepStarted = {
      testCaseStartedId: this.testCaseRun.id,
      testStepId: this.testStep.id,
      timestamp: toCucumberTimestamp(this.startTime.getTime()),
    };
    return { testStepStarted };
  }

  private buildTestStepFinished() {
    const error = this.getStepError();
    const status = this.getStatus(error);
    const testStepFinished: messages.TestStepFinished = {
      testCaseStartedId: this.testCaseRun.id,
      testStepId: this.testStep.id,
      testStepResult: {
        duration: messages.TimeConversion.millisecondsToDuration(this.duration),
        status,
        // 'message' is deprecated since cucumber 10.4 in favor of 'exception' field
        // But we keep both for compatibility with other reporters.
        // See: https://github.com/cucumber/react-components/pull/345
        message: isStepFailed(status) && error ? buildErrorMessage(error) : undefined,
        exception: isStepFailed(status) && error ? buildException(error) : undefined,
      },
      timestamp: toCucumberTimestamp(this.startTime.getTime() + this.duration),
    };
    return { testStepFinished };
  }

  private getStatus(error?: pw.TestError): messages.TestStepResultStatus {
    switch (true) {
      // When calling test.skip(), it actually throws an error
      case isSkippedError(error):
        return messages.TestStepResultStatus.SKIPPED;
      case Boolean(error):
        return messages.TestStepResultStatus.FAILED;
      // Steps (and hooks) that have no corresponding Playwright step were not executed
      // in this particular attempt and should be reported as SKIPPED.
      //
      // For scenario steps this happens when a prior step failed — subsequent steps have no pwStep.
      //
      // For BEFORE_TEST_RUN hooks (BeforeAll) this can happen on a retry: PW runs BeforeAll only
      // once per worker (credited to the first scenario). If scenario B fails and is retried, its
      // attempt 1 runs BeforeAll in the new worker (has a real pwStep). When TestCase.addHooks()
      // processes attempt 1, it adds BeforeAll to the shared TestCase used for all attempts.
      // Then buildMessages() for attempt 0 finds BeforeAll in the TestCase but has no matching
      // pwStep (BeforeAll was credited to scenario A in the original worker). Emitting SKIPPED is
      // correct: the hook was a declared prerequisite, but was already handled by a prior scenario
      // in the same worker and therefore did not execute as part of this attempt.
      case !this.wasExecuted():
        return messages.TestStepResultStatus.SKIPPED;
      default:
        return messages.TestStepResultStatus.PASSED;
    }
  }

  private getStepError() {
    if (this.pwStep) {
      return this.testCaseRun.getStepError(this.pwStep);
    }
  }
}

function isStepFailed(status: messages.TestStepResultStatus) {
  return status === messages.TestStepResultStatus.FAILED;
}
