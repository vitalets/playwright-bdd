/**
 * Custom reporter that prints step info to stdout.
 */
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  onStepEnd(_test: TestCase, _result: TestResult, { title, location }: TestStep) {
    const file = location?.file;
    const relFile = file ? path.relative(process.cwd(), file) : '';
    // eslint-disable-next-line no-console
    console.log(title, `${relFile}:${location?.line || 0}:${location?.column || 0}`);
  }
}

export default MyReporter;
