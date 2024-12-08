import * as messages from '@cucumber/messages';
import * as pw from '@playwright/test/reporter';
import { randomUUID } from 'node:crypto';
import { toCucumberTimestamp } from './timing';

export class TestRun {
  public id = randomUUID();

  buildTestRunStarted({ startTime }: pw.FullResult) {
    const testRunStarted: messages.TestRunStarted = {
      id: this.id,
      timestamp: toCucumberTimestamp(startTime.getTime()),
    };
    return { testRunStarted };
  }

  // See: https://github.com/cucumber/messages/blob/main/messages.md#testrunfinished
  // todo: there are also new props: message and exception,
  // they could be populated in reporter.onError handler
  buildTestRunFinished({ status, startTime, duration }: pw.FullResult) {
    const testRunFinished: messages.TestRunFinished = {
      testRunStartedId: this.id,
      success: status === 'passed',
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
      // message: 'This is a message',
      // exception: {
      //   type: 'Error',
      //   message: 'This is an exception',
      //   stackTrace: 'This is a stack trace',
      // },
    };
    return { testRunFinished };
  }
}
