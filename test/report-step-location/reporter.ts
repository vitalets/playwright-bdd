/**
 * Custom reporter that prints step info to stdout.
 */
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  onStepEnd(test: TestCase, result: TestResult, { title, location }: TestStep) {
    const file = location?.file;
    if (!file) return;
    const relFile = path.relative(process.cwd(), file);
    // eslint-disable-next-line no-console
    console.log(title, `${relFile}:${location.line}:${location.column}`);
  }
}

export default MyReporter;
