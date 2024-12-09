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
import { stripAnsiEscapes } from '../../../utils/stripAnsiEscapes.js';
import { TestCaseRun } from './TestCaseRun';
import { toCucumberTimestamp } from './timing';
import { TestStepAttachments } from './TestStepAttachments';

export type TestStepRunEnvelope = Pick<
  messages.Envelope,
  | 'testStepStarted' // prettier-ignore
  | 'testStepFinished'
  | 'attachment'
>;

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
        message: isFailed(status) && error ? buildErrorMessage(error) : undefined,
        exception: isFailed(status) && error ? buildException(error) : undefined,
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
      // For hooks that were not executed we return PASSED, not SKIPPED.
      // Because these hooks can be from another run attempt of this testCase.
      // If marked as skipped, the whole run is marked as skipped in reporter.
      case !this.isHook() && !this.wasExecuted():
        return messages.TestStepResultStatus.SKIPPED;
      default:
        return messages.TestStepResultStatus.PASSED;
    }
  }

  private getStepError() {
    if (!this.pwStep) return;
    if (this.testCaseRun.errorSteps.has(this.pwStep)) {
      return this.pwStep.error;
    }
    // For timeouted test run show concatenated error in the timeouted step
    if (this.testCaseRun.isTimeouted() && this.pwStep === this.testCaseRun.timeoutedStep) {
      return {
        message: this.testCaseRun.result.errors?.map((e) => e.message).join('\n\n'),
      };
    }
  }
}

function buildErrorMessage(error: pw.TestError) {
  return stripAnsiEscapes([error.message, error.snippet].filter(Boolean).join('\n'));
}

function buildException(error: pw.TestError): messages.Exception {
  return {
    type: 'Error',
    message: buildErrorMessage(error),
    // todo: extract only trace?
    stackTrace: error.stack ? extractStackTrace(stripAnsiEscapes(error.stack)) : undefined,
  };
}

function extractStackTrace(errorStack: string) {
  return errorStack
    .split('\n')
    .filter((line) => line.match(/^\s+at .*/))
    .join('\n');
}

/**
 * When calling test.skip() in Playwright test, it throws an error with message:
 * "Test is skipped".
 * This error exists in step, but it is not a real error, it is a skipped step.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L223
 */
function isSkippedError(error?: pw.TestError) {
  return Boolean(error?.message?.includes('Test is skipped:'));
}

function isFailed(status: messages.TestStepResultStatus) {
  return status === messages.TestStepResultStatus.FAILED;
}
