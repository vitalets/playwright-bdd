/**
 * Custom reporter that prints steps tree to file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import { toPosixPath } from '../../src/utils/paths';

// add 'fixture' to debug
const CATEGORIES_TO_REPORT = ['hook', 'test.step', 'attach'];
const TITLES_TO_REPORT = [
  'fixture: $beforeEach',
  'fixture: $afterEach',
  'page.goto(https://example.com)',
];

function shouldReportStep({ title, category }: TestStep) {
  if (CATEGORIES_TO_REPORT.includes(category)) return true;
  if (TITLES_TO_REPORT.includes(title)) return true;
}

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
    return true;
  }
}

function stringifySteps(steps: TestStep[]): string[] {
  const lines: string[] = [];

  steps
    .filter((step) => shouldReportStep(step))
    .map((step) => {
      const location = stringifyLocation(step.location);
      const line = [`[${step.category}]`, step.title, location].filter(Boolean).join(' ');
      const childrenLines = stringifySteps(step.steps).map((l) => indent(l));
      lines.push(line, ...childrenLines);
    });

  return lines;
}

function stringifyLocation(location: TestStep['location']) {
  const relFile = location?.file ? toPosixPath(path.relative(process.cwd(), location.file)) : '';
  return !relFile || relFile.includes('node_modules')
    ? ''
    : `${relFile}:${location?.line || 0}:${location?.column || 0}`;
}

function indent(value: string) {
  return value ? `${'    '}${value}` : value;
}
