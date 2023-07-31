/**
 * Helper to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { BDDConfig } from '../config';
import { jsStringWrap } from '../utils/jsStringWrap';

export type ImportTestFrom = {
  file: string;
  varName?: string;
};

export type Flags = {
  only?: boolean;
  skip?: boolean;
  fixme?: boolean;
};

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

  suite(title: string, children: string[], flags: Flags) {
    // prettier-ignore
    return [
      `test.describe${this.getSubFn(flags)}(${this.quoted(title)}, () => {`,
      '',
      ...children.map(indent),
      `});`,
      '',
    ];
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

  // eslint-disable-next-line max-params
  test(title: string, fixtures: Set<string>, children: string[], flags: Flags) {
    const fixturesStr = [...fixtures].join(', ');
    // prettier-ignore
    return [
    `test${this.getSubFn(flags)}(${this.quoted(title)}, async ({ ${fixturesStr} }) => {`,
    ...children.map(indent),
    `});`,
    '',
  ];
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

  tagsFixture(tagsMap: Map<string, string[]>, testKeySeparator: string) {
    return tagsMap.size > 0
      ? [
          '$tags: ({}, use, testInfo) => use({',
          ...Array.from(tagsMap)
            .map(([key, tags]) => `${JSON.stringify(key)}: ${JSON.stringify(tags)},`)
            .map(indent),
          `}[testInfo.titlePath.slice(2).join(${JSON.stringify(testKeySeparator)})] || []),`,
        ]
      : [];
  }

  private getSubFn(flags: Flags = {}) {
    if (flags.only) return '.only';
    if (flags.skip) return '.skip';
    if (flags.fixme) return '.fixme';
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
