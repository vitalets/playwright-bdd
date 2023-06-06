/**
 * Helpers to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';

export type ImportTestFrom = {
  file: string;
  varName?: string;
};

export function fileHeader(uri: string, importTestFrom?: ImportTestFrom) {
  const file = importTestFrom?.file || 'playwright-bdd';
  let varName = importTestFrom?.varName || 'test';
  if (varName !== 'test') varName = `${varName} as test`;
  // prettier-ignore
  return [
    `/** Generated from: ${uri} */`,
    `import { ${varName} } from "${file}";`,
    '',
  ];
}

export function suite(tags: string[], title: string, children: string[]) {
  // prettier-ignore
  return [
    `test.describe${getMark(tags)}(${JSON.stringify(title)}, () => {`,
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
export function test(tags: string[], title: string, fixtures: Set<string>, children: string[]) {
  const fixturesStr = [...fixtures].join(', ');
  // prettier-ignore
  return [
    `test${getMark(tags)}(${JSON.stringify(title)}, async ({ ${fixturesStr} }) => {`,
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

function getMark(tags: string[] = []) {
  if (tags.includes('@only')) return '.only';
  if (tags.includes('@skip')) return '.skip';
  if (tags.includes('@fixme')) return '.fixme';
  return '';
}

function indent(value: string) {
  return value ? `${'  '}${value}` : value;
}
