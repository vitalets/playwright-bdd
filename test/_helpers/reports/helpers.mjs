import path from 'node:path';
import assert from 'node:assert/strict';
import { jsonPaths } from 'json-paths';

export function assertJsonPaths(actualJson, expectedJson, rules) {
  const actualShape = jsonPaths(actualJson, rules);
  const expectedShape = jsonPaths(expectedJson, rules);
  assert.deepEqual(actualShape, expectedShape);
}

/**
 * Returns path with "/" separator on all platforms.
 * See: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
 */
export function toPosixPath(somePath) {
  return somePath.split(path.sep).join(path.posix.sep);
}
