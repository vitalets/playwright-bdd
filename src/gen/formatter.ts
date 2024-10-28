/**
 * Helper to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { jsStringWrap } from '../utils/jsStringWrap';
import { TestNode } from './testNode';
import { playwrightVersion } from '../playwright/utils';
import { DescribeConfigureOptions } from '../playwright/types';
import { toPosixPath } from '../utils/paths';
import { BDDConfig } from '../config/types';
import { ScenarioHookType } from '../hooks/scenario';
import { WorkerHookType } from '../hooks/worker';

const supportsTags = playwrightVersion >= '1.42.0';

export type StepFixtureName = 'Given' | 'When' | 'Then' | 'And' | 'But';
export type ImportTestFrom = {
  file: string;
  varName?: string;
};

export class Formatter {
  constructor(private config: BDDConfig) {}

  fileHeader(featureUri: string, importTestFrom?: ImportTestFrom) {
    // always use "/" for imports, see #91
    const importTestFromFile = toPosixPath(importTestFrom?.file || 'playwright-bdd');
    let varName = importTestFrom?.varName || 'test';
    if (varName !== 'test') varName = `${varName} as test`;
    return [
      `/** Generated from: ${featureUri} */`, // prettier-ignore
      // this.quoted() is not possible for 'import from' as backticks not parsed
      `import { ${varName} } from ${JSON.stringify(importTestFromFile)};`,
      '',
    ];
  }

  describe(node: TestNode, children: string[]) {
    const firstLine = `test.${this.getFunction('describe', node)}(${this.quoted(node.title)}, () => {`;
    if (!children.length) return [`${firstLine}});`, ''];
    return [
      firstLine, // prettier-ignore
      ...this.describeConfigure(node).map(indent),
      ...this.markAsFailing(node).map(indent),
      // we dont render test.slow() here, b/c each test.slow() call multilies timeout
      // that is not now tags are assumed to work
      '',
      ...children.map(indent),
      `});`,
      '',
    ];
  }

  beforeEach(title: string, fixtures: Set<string>, children: string[]) {
    const titleStr = title ? `${this.quoted(title)}, ` : '';
    const fixturesStr = [...fixtures].join(', ');
    return [
      `test.beforeEach(${titleStr}async ({ ${fixturesStr} }) => {`,
      ...children.map(indent),
      `});`,
      '',
    ];
  }

  scenarioHooksCall(type: ScenarioHookType) {
    return [
      type === 'before'
        ? `test.beforeEach(({ $beforeEach }) => {});`
        : `test.afterEach(({ $afterEach }) => {});`,
    ];
  }

  workerHooksCall(type: WorkerHookType, fixturesNames: string[]) {
    const runWorkerHooksFixture = '$runWorkerHooks';
    const fixturesStr = fixturesNames.join(', ');
    const allFixturesStr = [runWorkerHooksFixture, ...fixturesNames].join(', ');
    return [
      `test.${type}(({ ${allFixturesStr} }) => ${runWorkerHooksFixture}(${this.quoted(type)}, { ${fixturesStr} }));`,
    ];
  }

  test(node: TestNode, fixtures: Set<string>, children: string[]) {
    const fixturesStr = [...fixtures].join(', ');
    const title = this.quoted(node.title);
    const tags = this.testTags(node);
    const firstLine = `${this.getFunction('test', node)}(${title}, ${tags}async ({ ${fixturesStr} }) => {`;
    if (!children.length) return [`${firstLine}});`, ''];
    const lines = [
      firstLine, // prettier-ignore
      // We use test.fail() in the test body instead of test.fail('...', () => { ... })
      // It allows to apply .only() / .skip() on failing tests.
      // See: https://github.com/microsoft/playwright/issues/30662
      ...this.markAsFailing(node).map(indent),
      ...children.map(indent),
      `});`,
      '',
    ];
    // Wrap test into anonymous describe in case of retries
    // See: https://github.com/microsoft/playwright/issues/10825
    return node.specialTags.retries !== undefined
      ? this.wrapInAnonymousDescribe([
          ...this.describeConfigure(node).map(indent),
          '',
          ...lines.map(indent),
        ])
      : lines;
  }

  // eslint-disable-next-line max-params
  step(
    keywordEng: StepFixtureName,
    text: string,
    argument?: PickleStepArgument,
    fixtureNames: string[] = [],
  ) {
    const fixtures = fixtureNames.length ? `{ ${fixtureNames.join(', ')} }` : '';
    const argumentArg = argument ? JSON.stringify(argument) : fixtures ? 'null' : '';
    const textArg = this.quoted(text);
    const args = [textArg, argumentArg, fixtures].filter((arg) => arg !== '').join(', ');
    return `await ${keywordEng}(${args});`;
  }

  missingStep(keywordEng: StepFixtureName, text: string) {
    return `await ${keywordEng}(${this.quoted(text)}); // missing step`;
  }

  testUse(lines: string[]) {
    return ['test.use({', ...lines.map(indent), '});'];
  }

  worldFixture(worldFixtureName: string) {
    return [`$world: ({ ${worldFixtureName} }, use) => use(${worldFixtureName}),`];
  }

  testFixture() {
    return [`$test: ({}, use) => use(test),`];
  }

  uriFixture(featureUri: string) {
    return [`$uri: ({}, use) => use(${this.quoted(featureUri)}),`];
  }

  scenarioHooksFixtures(type: ScenarioHookType, fixtureNames: string[]) {
    if (!fixtureNames.length) return [];
    const targetFixtureName = type === 'before' ? '$beforeEachFixtures' : '$afterEachFixtures';
    const fixturesStr = fixtureNames.join(', ');
    return [`${targetFixtureName}: ({ ${fixturesStr} }, use) => use({ ${fixturesStr} }),`];
  }

  private getFunction(baseFn: 'test' | 'describe', node: TestNode) {
    if (node.specialTags.only) return `${baseFn}.only`;
    if (node.specialTags.skip) return `${baseFn}.skip`;
    if (node.specialTags.fixme) return `${baseFn}.fixme`;
    return baseFn;
  }

  private describeConfigure(node: TestNode) {
    const options: DescribeConfigureOptions = {};
    const { retries, timeout, mode } = node.specialTags;
    if (retries !== undefined) options.retries = retries;
    if (timeout !== undefined) options.timeout = timeout;
    if (mode !== undefined) options.mode = mode;
    return Object.keys(options).length
      ? [`test.describe.configure(${JSON.stringify(options)});`]
      : [];
  }

  private wrapInAnonymousDescribe(lines: string[]) {
    return [
      'test.describe(() => {', // prettier-ignore
      ...lines,
      `});`,
      '',
    ];
  }

  private markAsFailing(node: TestNode) {
    return node.specialTags.fail ? [`test.fail();`] : [];
  }

  private testTags(node: TestNode) {
    return supportsTags && node.tags.length
      ? `{ tag: [${node.tags.map((tag) => this.quoted(tag)).join(', ')}] }, `
      : '';
  }

  /**
   * Apply this function only to string literals (mostly titles here).
   * Objects and arrays are handled with JSON.stringify,
   * b/c object keys can't be in backticks.
   * See: https://stackoverflow.com/questions/33194138/template-string-as-object-property-name
   */
  private quoted(str: string) {
    return jsStringWrap(str, { quotes: this.config.quotes });
  }
}

export function indent(value: string) {
  return value ? `${'  '}${value}` : value;
}
