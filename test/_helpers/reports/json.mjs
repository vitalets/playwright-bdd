/**
 * Assertion of Cucumber json reports.
 */
import fs from 'node:fs';
import { assertJsonPaths, toPosixPath } from './helpers.mjs';

export function assertJsonReport(actualFile, expectedFile) {
  const actualJson = getJsonFromFile(actualFile);
  const expectedJson = getJsonFromFile(expectedFile);
  assertJsonPaths(actualJson, expectedJson, rules);
}

export function getJsonFromFile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const rules = {
  // ignored b/c there is no stepDefinitions (yet)
  // See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/json_formatter.ts#L279
  'elements.#.steps.#.match.location': null,
  // Embedding payload shape can vary (or be absent) depending on runtime/dependency versions.
  'elements.#.steps.#.embeddings.#.data': null,
  'elements.#.steps.#.embeddings.#.mime_type': null,
  // todo: check why tags line is empty
  'elements.#.tags.#.line': null,

  // these paths are compared by values, not by counter.
  id: 'value',
  name: 'value',
  uri: toPosixPath,
  'metadata.#.name': 'value',
  'metadata.#.value': 'value',
  'elements.#.steps.#.result.status': 'value',
  'elements.#.steps.#.name': 'value',
};
