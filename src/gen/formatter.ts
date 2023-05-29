/**
 * Helpers to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { fixtureParameterNames } from '../pwstyle/fixtureParameterNames';
import { FixturesDefinition } from '../pwstyle/types';

export type ImportTestFrom = {
  file: string;
  varName?: string;
};

export function fileHeader(uri: string, { file, varName }: ImportTestFrom) {
  const importVar = !varName || varName === 'test' ? 'test' : `${varName} as test`;
  // prettier-ignore
  return [
    `/** Generated from: ${uri} */`,
    `import { ${importVar} } from "${file}";`,
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
export function step(keyword: string, text: string, argument?: PickleStepArgument, fixtureNames: string[] = []) {
  const fixtures = fixtureNames.length ? `{ ${fixtureNames.join(', ')} }` : '';
  const argumentArg = argument ? JSON.stringify(argument) : fixtures ? 'null' : '';
  const textArg = JSON.stringify(text);
  const args = [textArg, argumentArg, fixtures].filter((arg) => arg !== '').join(', ');
  return `await ${keyword}(${args});`;
}

export function buildCustomFixturesDefinitionArg(fixtures: FixturesDefinition) {
  const lines: string[] = [];
  const fixtureNames = Object.keys(fixtures) as (keyof FixturesDefinition)[];
  fixtureNames.forEach((fixtureName) => {
    const value = fixtures[fixtureName];
    const isTuple = Array.isArray(value);
    // @ts-expect-error shorter than making whole checks for value[1]
    const isOption = isTuple && Boolean(value[1]?.option);
    if (isOption) {
      lines.push(`${fixtureName}: ${JSON.stringify(value)}`);
      return;
    }
    const fn = isTuple ? value[0] : value;
    const deps = fixtureParameterNames(fn).join(', ');
    const newFn = `({ ${deps} }, ...args) => useFixture("${fixtureName}", { ${deps} }, ...args)`;
    const newValue = isTuple ? `[ ${newFn}, ${JSON.stringify(value[1])}]` : newFn;
    lines.push(`${fixtureName}: ${newValue}`);
  });
  return lines.length ? `{ ${lines.join(', ')} }` : '';
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
