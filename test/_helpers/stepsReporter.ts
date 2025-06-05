/**
 * Custom reporter that prints steps tree to file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Reporter, TestCase, TestError, TestResult, TestStep } from '@playwright/test/reporter';
import { toPosixPath } from '../../src/utils/paths';
import { stripAnsiEscapes } from '../../src/utils/stripAnsiEscapes';

type StepsReporterOptions = {
  outputFile: string;
  categories?: string[] | null;
  titles?: (string | RegExp)[];
};

const defaults: Pick<StepsReporterOptions, 'categories' | 'titles'> = {
  // step category and titles to include in report
  // add 'fixture' to debug
  categories: ['hook', 'test.step', 'attach'],
  titles: [/fixture: \$beforeEach$/, /fixture: \$afterEach$/],
};

export default class StepsReporter implements Reporter {
  private lines: string[] = [];
  private options: StepsReporterOptions;

  constructor(options: StepsReporterOptions) {
    this.options = { ...defaults, ...options };
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.lines.length) this.lines.push('');
    this.lines.push(test.title);
    this.lines.push(...this.stringifySteps(result.steps).map((l) => indent(l)));
  }

  onError(_error: TestError) {
    // global error, e.g. error in afterAll hook
  }

  async onEnd() {
    const content = this.lines.map((l) => stripAnsiEscapes(l)).join('\n');
    fs.mkdirSync(path.dirname(this.options.outputFile), { recursive: true });
    fs.writeFileSync(this.options.outputFile, content);
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
        const error = step.error ? stringifyError(step.error) : '';
        const line = [`[${step.category}]`, step.title, location, error].filter(Boolean).join(' ');
        const childrenLines = this.stringifySteps(step.steps).map((l) => indent(l));
        lines.push(line, ...childrenLines);
      });

    return lines;
  }

  private shouldReportStep(step: TestStep) {
    const { category, title } = step;
    if (!this.options.categories || this.options.categories.includes(category)) return true;
    if (this.isTitleMatched(title)) return true;
  }

  private isTitleMatched(title: string) {
    return this.options.titles?.some((t) => {
      return typeof t === 'string' ? title.includes(t) : t.test(title);
    });
  }
}

function stringifyLocation(location: TestStep['location']) {
  const relFile = location?.file ? toPosixPath(path.relative(process.cwd(), location.file)) : '';
  return !relFile || relFile.includes('node_modules')
    ? ''
    : `${relFile}:${location?.line || 0}:${location?.column || 0}`;
}

function stringifyError(error: TestError) {
  return error.message?.split('\n')[0] || '';
}

function indent(value: string) {
  return value ? `${'    '}${value}` : value;
}
