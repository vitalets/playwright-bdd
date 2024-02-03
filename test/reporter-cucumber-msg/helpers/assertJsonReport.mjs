/**
 * Cucumber json report comparison helper.
 */
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { buildShape } from './shared.mjs';

// these paths are ignored in comparison.
const ignorePaths = [
  // ignored b/c there is no stepDefinitions (yet)
  // See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/json_formatter.ts#L279
  'elements.#.steps.#.match.location',
];

// these paths are compared by values, not by counter.
const valuePaths = [
  'name', // prettier-ignore
  'elements.#.steps.#.result.status',
  'elements.#.steps.#.name',
];

/**
 * Compares two Cucumber json objects.
 * Uses 'shape' object that contians of all paths of objects with counter.
 */
export async function assertJsonReport({ expectedFile, actualFile }) {
  const expectedJson = expectedFile.endsWith('.js')
    ? (await import(expectedFile)).default
    : getJsonFromFile(expectedFile);
  const actualJson = getJsonFromFile(actualFile);

  const expectedShape = buildShape(expectedJson, { ignorePaths, valuePaths });
  const actualShape = buildShape(actualJson, { ignorePaths, valuePaths });

  expect(actualShape).toStrictEqual(expectedShape);
}

/**
 * Reads JSON report from file.
 */
function getJsonFromFile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
