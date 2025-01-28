/**
 * Helper to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { jsStringWrap } from '../utils/jsStringWrap';
import { playwrightVersion } from '../playwright/utils';
import { DescribeConfigureOptions } from '../playwright/types';
import { toPosixPath } from '../utils/paths';
import { BDDConfig } from '../config/types';
import { ScenarioHookType } from '../hooks/scenario';
import { WorkerHookType } from '../hooks/worker';
import { SpecialTags } from './specialTags';
import {
  AFTER_ALL_HOOKS_GROUP_NAME,
  AFTER_EACH_HOOKS_GROUP_NAME,
  BEFORE_ALL_HOOKS_GROUP_NAME,
  BEFORE_EACH_HOOKS_GROUP_NAME,
} from '../hooks/const';

const supportsTags = playwrightVersion >= '1.42.0';

type StepFixtureName = 'Given' | 'When' | 'Then' | 'And' | 'But';
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
      `// Generated from: ${featureUri}`, // prettier-ignore
      // this.quoted() is not possible for 'import from' as backticks not parsed
      `import { ${varName} } from ${JSON.stringify(importTestFromFile)};`,
      '',
    ];
  }

  describe(title: string, specialTags: SpecialTags, children: string[]) {
    const titleStr = this.quoted(title);
    const fn = this.withSubFunction('describe', specialTags);
    const firstLine = `test.${fn}(${titleStr}, () => {`;
    if (!children.length) return [`${firstLine}});`, ''];
    return [
      firstLine, // prettier-ignore
      ...this.describeConfigure(specialTags).map(indent),
      ...this.markAsFailing(specialTags).map(indent),
      // we don't render test.slow() here, b/c each call of test.slow() multiplies timeout
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
    const title = type === 'before' ? BEFORE_EACH_HOOKS_GROUP_NAME : AFTER_EACH_HOOKS_GROUP_NAME;
    return [
      type === 'before'
        ? `test.beforeEach(${this.quoted(title)}, ({ $beforeEach }) => {});`
        : `test.afterEach(${this.quoted(title)}, ({ $afterEach }) => {});`,
    ];
  }

  workerHooksCall(type: WorkerHookType, fixturesNames: Set<string>, bddDataVar: string) {
    // For beforeAll we run hooks, but for afterAll just register, and run on worker teardown.
    const runWorkerHooksFixture =
      type === 'beforeAll' ? '$runBeforeAllHooks' : '$registerAfterAllHooks';
    const fixturesStr = [...fixturesNames].join(', ');
    const allFixturesStr = [runWorkerHooksFixture, ...fixturesNames].join(', ');
    const title = type === 'beforeAll' ? BEFORE_ALL_HOOKS_GROUP_NAME : AFTER_ALL_HOOKS_GROUP_NAME;
    return [
      // eslint-disable-next-line max-len
      `test.${type}(${this.quoted(title)}, ({ ${allFixturesStr} }) => ${runWorkerHooksFixture}(test, { ${fixturesStr} }, ${bddDataVar}));`,
    ];
  }

  // eslint-disable-next-line max-params
  test(
    title: string,
    tags: string[],
    specialTags: SpecialTags,
    fixtures: Set<string>,
    pickleId: string,
    children: string[],
  ) {
    const titleStr = this.quoted(title);
    const tagsStr = this.testTags(tags);
    const fixturesStr = [...fixtures].join(', ');
    const fn = this.withSubFunction('test', specialTags);
    const firstLine = `${fn}(${titleStr}, ${tagsStr}async ({ ${fixturesStr} }) => { // test: ${pickleId}`;
    const lines = [
      firstLine, // prettier-ignore
      // We use test.fail() in the test body instead of test.fail('...', () => { ... })
      // It allows to apply .only() / .skip() on failing tests.
      // See: https://github.com/microsoft/playwright/issues/30662
      ...this.markAsFailing(specialTags).map(indent),
      ...children.map(indent),
      `});`,
      '',
    ];
    // Wrap test into anonymous describe in case of retries
    // See: https://github.com/microsoft/playwright/issues/10825
    return specialTags.retries !== undefined
      ? this.wrapInAnonymousDescribe([
          ...this.describeConfigure(specialTags).map(indent),
          '',
          ...lines.map(indent),
        ])
      : lines;
  }

  // eslint-disable-next-line max-params
  step(
    keywordEng: StepFixtureName,
    stepText: string,
    argument: PickleStepArgument | undefined,
    fixtureNames: Set<string>,
    pickleStepIds: string[],
  ) {
    const textArg = this.quoted(stepText);
    const fixtures = fixtureNames.size ? `{ ${[...fixtureNames].join(', ')} }` : '';
    const argumentArg = argument ? JSON.stringify(argument) : fixtures ? 'null' : '';
    const args = [textArg, argumentArg, fixtures].filter((arg) => arg !== '').join(', ');
    return `await ${keywordEng}(${args}); // step: ${pickleStepIds.join(',')}`;
  }

  /**
   * Renders test.use() call with fixtures.
   *
   * NOTE: don't generate worker-scoped fixtures in test file,
   * because it forces new worker creation.
   * See: https://github.com/microsoft/playwright/issues/33316
   */
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

  pageFixtureWithPromptAttachment() {
    return [
      `page: async ({ page, $prompt }, use) => {`,
      `  $prompt.setPage(page);`,
      `  await use(page);`,
      `},`,
    ];
  }

  scenarioHooksFixtures(type: ScenarioHookType, fixtureNames: string[]) {
    if (!fixtureNames.length) return [];
    const targetFixtureName = type === 'before' ? '$beforeEachFixtures' : '$afterEachFixtures';
    const fixturesStr = fixtureNames.join(', ');
    return [`${targetFixtureName}: ({ ${fixturesStr} }, use) => use({ ${fixturesStr} }),`];
  }

  private withSubFunction(baseFn: 'test' | 'describe', specialTags: SpecialTags) {
    if (specialTags.only) return `${baseFn}.only`;
    if (specialTags.skip) return `${baseFn}.skip`;
    if (specialTags.fixme) return `${baseFn}.fixme`;
    return baseFn;
  }

  private describeConfigure({ retries, timeout, mode }: SpecialTags) {
    const options: DescribeConfigureOptions = {};
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

  private markAsFailing(specialTags: SpecialTags) {
    return specialTags.fail ? [`test.fail();`] : [];
  }

  private testTags(tags: string[]) {
    return supportsTags && tags.length
      ? `{ tag: [${tags.map((tag) => this.quoted(tag)).join(', ')}] }, `
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

export function extractPickleIdFromLine(line: string) {
  const match = line.match(/\/\/ test: ([0-9a-f-]+)$/);
  if (match) {
    return { pickleId: match[1]!, index: match.index };
  }
}

/**
 * Extracts pickle step IDs from the comment at the end of the line.
 * Note:
 * - we can't use line.endsWith(`// step: ${gherkinStep.id}`), because for Scenario Outline
 * the same step is rendered multiple times with different pickle step ids.
 * - we can't use line.endsWith(`// step: ${pickleStep.id}`), because for Background
 * the same step is referenced by multiple pickle steps.
 */
export function extractPickleStepIdsFromLine(line: string) {
  const match = line.match(/\/\/ step: ([0-9a-f-,]+)$/);
  if (match) {
    return { pickleStepIds: match[1].split(','), index: match.index };
  }
}
