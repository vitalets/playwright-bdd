/**
 * Custom reporter that prints step info to file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

export default class MyReporter implements Reporter {
  private messages: string[] = [];
  constructor(private options: { outputFile: string }) {}

  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep) {
    const { title, location, category } = step;

    if (category === 'test.step' || category === 'hook') {
      const file = location?.file;
      const relFile = file ? path.relative(process.cwd(), file) : '';
      this.messages.push(`${title} ${relFile}:${location?.line || 0}:${location?.column || 0}`);
    }
  }

  async onEnd() {
    await fs.promises.mkdir(path.dirname(this.options.outputFile), { recursive: true });
    await fs.promises.writeFile(this.options.outputFile, this.messages.join('\n'));
  }
}
