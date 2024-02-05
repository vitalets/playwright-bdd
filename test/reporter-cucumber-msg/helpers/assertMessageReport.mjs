/**
 * Cucumber message report comparison helper.
 */
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { buildArrayShape } from './shared.mjs';

// these paths are ignored in comparison.
const getIgnorePaths = (isCCK) => [
  !isCCK ? 'meta' : '', // there is not meta message in cucumber test files
  'meta.ci',
  'hook',
  // todo: support stepDefinition messages
  'stepDefinition',
  'testCase.testSteps.#.stepDefinitionIds',
  // todo: support hook messages
  'testCase.testSteps.#.hookId',
];

// these paths are compared by values, not by counter.
const valuePaths = [
  'source.data', // prettier-ignore
  'pickle.name',
  'pickle.steps.#.text',
  'attachment.mediaType',
  'attachment.fileName',
];

/**
 * Compares two arrays of Cucumber messages.
 * Uses 'shape' object that contians of all paths inside all messages.
 */
export async function assertMessageReport({ expectedFile, actualFile, isCCK }) {
  const expectedMessages = expectedFile.endsWith('.js')
    ? (await import(expectedFile)).default
    : getMessagesFromFile(expectedFile);
  const actualMessages = getMessagesFromFile(actualFile);

  const ignorePaths = getIgnorePaths(isCCK);
  const expectedShape = buildArrayShape(expectedMessages, { ignorePaths, valuePaths });
  const actualShape = buildArrayShape(actualMessages, { ignorePaths, valuePaths });

  expect(actualShape).toStrictEqual(expectedShape);
}

/**
 * Reads messages from ndjson file and returns as array.
 */
function getMessagesFromFile(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
