/**
 * Handles whole test run.
 * See: https://github.com/cucumber/messages/blob/main/messages.md#testrunfinished
 */
import * as messages from '@cucumber/messages';
import * as pw from '@playwright/test/reporter';
import { randomUUID } from 'node:crypto';
import { toCucumberTimestamp } from './timing';
import { buildException } from './error';

export class TestRun {
  public id = randomUUID();
  private globalErrors: pw.TestError[] = [];

  buildTestRunStarted({ startTime }: pw.FullResult) {
    const testRunStarted: messages.TestRunStarted = {
      id: this.id,
      timestamp: toCucumberTimestamp(startTime.getTime()),
    };
    return { testRunStarted };
  }

  buildTestRunFinished({ status, startTime, duration }: pw.FullResult) {
    const error = this.globalErrors[0];
    const testRunFinished: messages.TestRunFinished = {
      testRunStartedId: this.id,
      success: status === 'passed',
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
      // We populate 'exception' property, although HTML reporter does not use it yet.
      // See: https://github.com/cucumber/html-formatter/issues/340
      exception: error ? buildException(error) : undefined,
    };
    return { testRunFinished };
  }

  registerGlobalError(error: pw.TestError) {
    this.globalErrors.push(error);
  }
}
