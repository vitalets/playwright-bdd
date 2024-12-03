/**
 * Custom reporter that prints steps tree to file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import { toPosixPath } from '../../src/utils/paths';

export default class MyReporter implements Reporter {
  private lines: string[] = [];
  constructor(private options: { outputFile: string }) {}

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.lines.length) this.lines.push('');
    this.lines.push(test.title);
    this.lines.push(...stringifySteps(result.steps).map((l) => indent(l)));
  }

  async onEnd() {
    fs.mkdirSync(path.dirname(this.options.outputFile), { recursive: true });
    fs.writeFileSync(this.options.outputFile, this.lines.join('\n'));
  }

  printsToStdio() {
    return false;
  }
}

function shouldReportStep({ title, category }: TestStep) {
  return category === 'test.step' || category === 'hook' || title.includes('page.goto');
}

function stringifySteps(steps: TestStep[]): string[] {
  const lines: string[] = [];

  steps.filter(shouldReportStep).map((step) => {
    const { location } = step;
    const relFile = location?.file ? toPosixPath(path.relative(process.cwd(), location.file)) : '';
    const line = `[${step.category}] ${step.title} ${relFile}:${location?.line || 0}:${location?.column || 0}`;
    const childrenLines = stringifySteps(step.steps).map((l) => indent(l));
    lines.push(line, ...childrenLines);
  });

  return lines;
}

function indent(value: string) {
  return value ? `${'    '}${value}` : value;
}
