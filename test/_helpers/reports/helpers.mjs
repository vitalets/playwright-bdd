import path from 'node:path';
import { expect } from '@playwright/test';
import { jsonPaths } from 'json-paths';

export function assertJsonPaths(actualJson, expectedJson, rules) {
  const actualShape = jsonPaths(actualJson, rules);
  const expectedShape = jsonPaths(expectedJson, rules);
  // Playwright's expect shows better diff
  expect(actualShape).toEqual(expectedShape);
}

/**
 * Returns path with "/" separator on all platforms.
 * See: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
 */
export function toPosixPath(somePath) {
  return somePath.split(path.sep).join(path.posix.sep);
}
