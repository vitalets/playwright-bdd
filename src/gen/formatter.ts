/**
 * Helpers to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';

export type ImportTestFrom = {
  file: string;
  varName?: string;
};

export type Flags = {
  only?: boolean;
  skip?: boolean;
  fixme?: boolean;
};

export function fileHeader(uri: string, importTestFrom?: ImportTestFrom) {
  const file = importTestFrom?.file || 'playwright-bdd';
  let varName = importTestFrom?.varName || 'test';
  if (varName !== 'test') varName = `${varName} as test`;
  // prettier-ignore
  return [
    `/** Generated from: ${uri} */`,
    `import { ${varName} } from ${JSON.stringify(file)};`,
    '',
  ];
}

export function suite(title: string, children: string[], flags: Flags) {
  // prettier-ignore
  return [
    `test.describe${getSubFn(flags)}(${JSON.stringify(title)}, () => {`,
    '',
    ...children.map(indent),
    `});`,
    '',
  ];
}

export function beforeEach(fixtures: Set<string>, children: string[]) {
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
export function test(title: string, fixtures: Set<string>, children: string[], flags: Flags) {
  const fixturesStr = [...fixtures].join(', ');
  // prettier-ignore
  return [
    `test${getSubFn(flags)}(${JSON.stringify(title)}, async ({ ${fixturesStr} }) => {`,
    ...children.map(indent),
    `});`,
    '',
  ];
}

// eslint-disable-next-line max-params
export function step(
  keyword: string,
  text: string,
  argument?: PickleStepArgument,
  fixtureNames: string[] = [],
) {
  const fixtures = fixtureNames.length ? `{ ${fixtureNames.join(', ')} }` : '';
  const argumentArg = argument ? JSON.stringify(argument) : fixtures ? 'null' : '';
  const textArg = JSON.stringify(text);
  const args = [textArg, argumentArg, fixtures].filter((arg) => arg !== '').join(', ');
  return `await ${keyword}(${args});`;
}

export function useFixtures(fixtures: string[]) {
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

export function testFixture() {
  return ['$test: ({}, use) => use(test),'];
}

export function tagsFixture(tagsMap: Map<string, string[]>, testKeySeparator: string) {
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

function getSubFn(flags: Flags = {}) {
  if (flags.only) return '.only';
  if (flags.skip) return '.skip';
  if (flags.fixme) return '.fixme';
  return '';
}

function indent(value: string) {
  return value ? `${'  '}${value}` : value;
}
