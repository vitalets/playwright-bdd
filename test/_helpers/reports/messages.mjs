/**
 * Assertion of Cucumber messages reports.
 */
import fs from 'node:fs';
import { assertJsonPaths, toPosixPath } from './helpers.mjs';

export function assertMessagesReport(actualFile, expectedFile, extraRules = {}) {
  const actualMessages = getMessagesFromFile(actualFile);
  const expectedMessages = getMessagesFromFile(expectedFile);
  assertJsonPaths(actualMessages, expectedMessages, { ...rules, ...extraRules });
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

const rules = {
  // in playwright-bdd we add only named hooks, so ignore hook.name from comparison
  'hook.name': null,
  // Cucumber does not log hook location column, but playwright-bdd does
  'hook.sourceReference.location.column': null,
  // hook.tagExpression is not supported by playwright-bdd (yet)
  'hook.tagExpression': null,
  // stepDefinition messages are not supported (yet)
  stepDefinition: null,
  'testCase.testSteps.#.stepDefinitionIds': null,
  // Playwright attachments always have name
  'attachment.fileName': null,

  // these paths are compared by values, not by total counter.
  'source.uri': toPosixPath,
  'gherkinDocument.uri': toPosixPath,
  'pickle.uri': toPosixPath,
  'pickle.name': 'value',
  'pickle.tags.#.name': 'value',
  'pickle.steps.#.text': 'value',
  'attachment.mediaType': 'value',
  'testCaseStarted.attempt': 'value',
  'testStepFinished.testStepResult.status': 'value',
  'testRunFinished.success': 'value',
  'hook.type': 'value',
};
