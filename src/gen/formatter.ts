/**
 * Helpers to format Playwright test file.
 */

import { PickleStepArgument } from '@cucumber/messages';

export function fileHeader(uri?: string) {
  // prettier-ignore
  return [
    `/** Generated from: ${uri} */`,
    `import { test } from "playwright-bdd";`,
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

export function beforeEach(keywords: Set<string>, children: string[]) {
  const fixtures = [...keywords].join(', ');
  // prettier-ignore
  return [
    `test.beforeEach(async ({ ${fixtures} }) => {`,
    ...children.map(indent),
    `});`,
    '',
  ];
}

// eslint-disable-next-line max-params
export function test(tags: string[], title: string, keywords: Set<string>, children: string[]) {
  const fixtures = [...keywords].join(', ');
  // prettier-ignore
  return [
    `test${getMark(tags)}(${JSON.stringify(title)}, async ({ ${fixtures} }) => {`,
    ...children.map(indent),
    `});`,
    '',
  ];
}

export function step(keyword: string, text: string, argument?: PickleStepArgument) {
  const args = [text, argument]
    .filter(Boolean)
    .map((arg) => JSON.stringify(arg))
    .join(', ');
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
