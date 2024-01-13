/**
 * Helper to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { BDDConfig } from '../config';
import { jsStringWrap } from '../utils/jsStringWrap';
import { TestNode } from './testNode';
import { BddWorldFixtures } from '../run/bddWorld';

export type ImportTestFrom = {
  file: string;
  varName?: string;
};

const TAGS_FIXTURE_TEST_KEY_SEPARATOR = '|';

export class Formatter {
  constructor(private config: BDDConfig) {}

  fileHeader(uri: string, importTestFrom?: ImportTestFrom) {
    const file = importTestFrom?.file || 'playwright-bdd';
    let varName = importTestFrom?.varName || 'test';
    if (varName !== 'test') varName = `${varName} as test`;
    return [
      `/** Generated from: ${uri} */`, // prettier-ignore
      // this.quoted() is not possible for 'import from' as backticks not parsed
      `import { ${varName} } from ${JSON.stringify(file)};`,
      '',
    ];
  }

  suite(node: TestNode, children: string[]) {
    const firstLine = `test.describe${this.getSubFn(node)}(${this.quoted(node.title)}, () => {`;
    if (!children.length) return [`${firstLine}});`, ''];
    return [firstLine, '', ...children.map(indent), `});`, ''];
  }

  beforeEach(fixtures: Set<string>, children: string[]) {
    const fixturesStr = [...fixtures].join(', ');
    // prettier-ignore
    return [
      `test.beforeEach(async ({ ${fixturesStr} }) => {`,
      ...children.map(indent),
      `});`,
      '',
    ];
  }

  test(node: TestNode, fixtures: Set<string>, children: string[]) {
    const fixturesStr = [...fixtures].join(', ');
    const title = this.quoted(node.title);
    const firstLine = `test${this.getSubFn(node)}(${title}, async ({ ${fixturesStr} }) => {`;
    if (!children.length) return [`${firstLine}});`, ''];
    return [firstLine, ...children.map(indent), `});`, ''];
  }

  // eslint-disable-next-line max-params
  step(keyword: string, text: string, argument?: PickleStepArgument, fixtureNames: string[] = []) {
    const fixtures = fixtureNames.length ? `{ ${fixtureNames.join(', ')} }` : '';
    const argumentArg = argument ? JSON.stringify(argument) : fixtures ? 'null' : '';
    const textArg = this.quoted(text);
    const args = [textArg, argumentArg, fixtures].filter((arg) => arg !== '').join(', ');
    return `await ${keyword}(${args});`;
  }

  missingStep(keyword: string, text: string) {
    return `// missing step: ${keyword}(${this.quoted(text)});`;
  }

  useFixtures(fixtures: string[]) {
    return fixtures.length > 0
      ? [
          '// == technical section ==', // prettier-ignore
          '',
          'test.use({',
          ...fixtures.map(indent),
          '});',
        ]
      : [];
  }

  testFixture() {
    return ['$test: ({}, use) => use(test),'];
  }

  bddWorldFixtures() {
    const fixturesObj: Record<keyof BddWorldFixtures, null> = {
      page: null,
      context: null,
      browser: null,
      browserName: null,
      request: null,
    };
    const fixtures = Object.keys(fixturesObj).join(', ');
    return [`$bddWorldFixtures: ({ ${fixtures} }, use) => use({ ${fixtures} }),`];
  }

  /**
   * For tests with tags create special $tags fixture
   * that maps test titles to corresponding tags.
   */
  tagsFixture(testNodes: TestNode[]) {
    const lines = testNodes
      .filter((node) => node.tags.length)
      .map((node) => {
        // remove first parent as it is the same for all tests: root suite
        const key = node.titlePath.slice(1).join(TAGS_FIXTURE_TEST_KEY_SEPARATOR);
        return `${JSON.stringify(key)}: ${JSON.stringify(node.tags)},`;
      });
    return lines.length > 0
      ? [
          '$tags: ({}, use, testInfo) => use({',
          ...lines.map(indent),
          // .slice(2) -> b/c we remove filename and root suite title
          `}[testInfo.titlePath.slice(2).join(${JSON.stringify(
            TAGS_FIXTURE_TEST_KEY_SEPARATOR,
          )})] || []),`,
        ]
      : [];
  }

  scenarioHookFixtures(fixtureNames: string[]) {
    if (!fixtureNames.length) return [];
    const fixtures = fixtureNames.join(', ');
    return [`$scenarioHookFixtures: ({ ${fixtures} }, use) => use({ ${fixtures} }),`];
  }

  workerHookFixtures(fixtureNames: string[]) {
    if (!fixtureNames.length) return [];
    const fixtures = fixtureNames.join(', ');
    const scope = this.quoted('worker');
    return [
      `$workerHookFixtures: [({ ${fixtures} }, use) => use({ ${fixtures} }), { scope: ${scope} }],`,
    ];
  }

  langFixture(lang: string) {
    return [`$lang: ({}, use) => use(${this.quoted(lang)}),`];
  }

  private getSubFn(node: TestNode) {
    if (node.flags.only) return '.only';
    if (node.flags.skip) return '.skip';
    if (node.flags.fixme) return '.fixme';
    return '';
  }

  /**
   * Apply this function only to string literals (mostly titles here).
   * Objects and arrays are handled with JSON.strinigfy,
   * b/c object keys can't be in backtiks.
   * See: https://stackoverflow.com/questions/33194138/template-string-as-object-property-name
   */
  private quoted(str: string) {
    return jsStringWrap(str, { quotes: this.config.quotes });
  }
}

function indent(value: string) {
  return value ? `${'  '}${value}` : value;
}
