/**
 * Custom reporter that prints Playwright test results JSON into file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import { stripAnsiEscapes } from '../../src/utils/stripAnsiEscapes';
import { sanitizeForFilePath } from '../../src/utils/paths';

type RawJsonReporterOptions = {
  outputDir: string;
};

export default class RawJsonReporter implements Reporter {
  constructor(private options: RawJsonReporterOptions) {}

  onTestEnd(test: TestCase, result: TestResult) {
    const filePath = this.buildFilePathForTest(test);

    result.steps = dropParentRecursive(result.steps);
    const content = stripAnsiEscapes(JSON.stringify(result, null, 2));

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  private buildFilePathForTest(test: TestCase) {
    const fileName = test
      .titlePath()
      .slice(-2)
      .filter(Boolean)
      .map((s) => sanitizeForFilePath(s))
      .join(path.sep);

    return path.join(this.options.outputDir, `${fileName}.json`);
  }
}

function dropParentRecursive(steps: TestStep[]): TestStep[] {
  return steps.map((step) => {
    delete step.parent;
    if (step.steps?.length) step.steps = dropParentRecursive(step.steps);
    return step;
  });
}
