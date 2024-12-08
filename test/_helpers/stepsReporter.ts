/**
 * Custom reporter that prints steps tree to file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import { toPosixPath } from '../../src/utils/paths';

type StepReporterOptions = {
  outputFile: string;
  categories?: string[];
  titles?: string[];
};

const defaults: Pick<StepReporterOptions, 'categories' | 'titles'> = {
  // add 'fixture' to debug
  categories: ['hook', 'test.step', 'attach'],
  titles: ['fixture: $beforeEach', 'fixture: $afterEach'],
};

export default class StepsReporter implements Reporter {
  private lines: string[] = [];
  private options: StepReporterOptions;

  constructor(options: StepReporterOptions) {
    this.options = { ...defaults, ...options };
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.lines.length) this.lines.push('');
    this.lines.push(test.title);
    this.lines.push(...this.stringifySteps(result.steps).map((l) => indent(l)));
  }

  async onEnd() {
    fs.mkdirSync(path.dirname(this.options.outputFile), { recursive: true });
    fs.writeFileSync(this.options.outputFile, this.lines.join('\n'));
  }

  printsToStdio() {
    return false;
  }

  private stringifySteps(steps: TestStep[]): string[] {
    const lines: string[] = [];

    steps
      .filter((step) => this.shouldReportStep(step))
      .map((step) => {
        const location = stringifyLocation(step.location);
        const line = [`[${step.category}]`, step.title, location].filter(Boolean).join(' ');
        const childrenLines = this.stringifySteps(step.steps).map((l) => indent(l));
        lines.push(line, ...childrenLines);
      });

    return lines;
  }

  private shouldReportStep({ category, title }: TestStep) {
    if (this.options.categories?.includes(category)) return true;
    if (this.options.titles?.includes(title)) return true;
  }
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
