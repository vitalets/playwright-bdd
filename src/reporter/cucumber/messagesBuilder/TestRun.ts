import * as messages from '@cucumber/messages';
import * as pw from '@playwright/test/reporter';
import { randomUUID } from 'node:crypto';
import { toCucumberTimestamp } from './timing';

export class TestRun {
  private id = randomUUID();
  constructor(private fullResult: pw.FullResult) {}

  buildTestRunStarted() {
    const { startTime } = this.fullResult;
    const testRunStarted: messages.TestRunStarted = {
      id: this.id,
      timestamp: toCucumberTimestamp(startTime.getTime()),
    };
    return { testRunStarted };
  }

  // See: https://github.com/cucumber/messages/blob/main/messages.md#testrunfinished
  // todo: there are also new props: message and exception
  buildTestRunFinished() {
    const { startTime, duration } = this.fullResult;
    const testRunFinished: messages.TestRunFinished = {
      testRunStartedId: this.id,
      success: this.fullResult.status === 'passed',
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
    };
    return { testRunFinished };
  }
}
