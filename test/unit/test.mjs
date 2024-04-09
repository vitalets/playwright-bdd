import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect, TestDir } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (finalizePattern)`, async () => {
  const modulePath = path.resolve('dist/utils/paths.js');
  const { finalizePattern } = await import(pathToFileURL(modulePath));

  expect(finalizePattern('a/steps', 'js')).toEqual('a/steps/**/*.js');
  expect(finalizePattern('a/steps/', 'js')).toEqual('a/steps/**/*.js');
  expect(finalizePattern('a/steps//', 'js')).toEqual('a/steps/**/*.js');
  expect(finalizePattern('a/steps/**', 'js')).toEqual('a/steps/**/*.js');
  expect(finalizePattern('a/steps/*', 'js')).toEqual('a/steps/*.js');
  expect(finalizePattern('a/steps/*.js', 'js')).toEqual('a/steps/*.js');
  expect(finalizePattern('a/steps/**/*.js', 'js')).toEqual('a/steps/**/*.js');

  // backslash (on win)
  if (path.sep === '\\') {
    expect(finalizePattern('a\\steps', 'js')).toEqual('a/steps/**/*.js');
    expect(finalizePattern('a\\steps\\**', 'js')).toEqual('a/steps/**/*.js');
  }
});
