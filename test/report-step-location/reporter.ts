/**
 * Custom reporter that prints step info to stdout.
 */
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  onStepEnd(test: TestCase, result: TestResult, { title, location }: TestStep) {
    if (title.includes('page.goto') && location) {
      // eslint-disable-next-line no-console
      console.log(title, `${location.file}:${location.line}:${location.column}`);
    }
  }
}

export default MyReporter;
