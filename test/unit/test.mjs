import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect, TestDir, normalize } from '../_helpers/index.mjs';

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

test(`${testDir.name} (extractTagsFromPath)`, async () => {
  const modulePath = path.resolve('dist/steps/tags.js');
  const { extractTagsFromPath } = await import(pathToFileURL(modulePath));

  // directories
  expect(extractTagsFromPath(normalize('features/@foo/'))).toEqual(['@foo']);
  expect(extractTagsFromPath(normalize('features/@foo/@bar/'))).toEqual(['@foo', '@bar']);
  expect(extractTagsFromPath(normalize('features/@foo @bar/'))).toEqual(['@foo', '@bar']);
  expect(extractTagsFromPath(normalize('features/tag @foo and @bar/'))).toEqual(['@foo', '@bar']);
  expect(extractTagsFromPath(normalize('features/auth@foo@bar/'))).toEqual(['@foo', '@bar']);
  expect(extractTagsFromPath(normalize('features/@foo,@bar/'))).toEqual(['@foo,', '@bar']);
  expect(extractTagsFromPath(normalize('features/@foo,bar/'))).toEqual(['@foo,bar']);
  expect(extractTagsFromPath(normalize('features/@foo:123/'))).toEqual(['@foo:123']);
  expect(extractTagsFromPath(normalize('foo/node_modules/@foo/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('@bar/node_modules/@foo/@bar/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('.node_modules/@foo @bar/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('node_modules/auth@foo@bar/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('node_modules/@foo,@bar/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('node_modules/@foo,bar/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('node_modules/@foo:123/'))).toEqual([]);

  expect(extractTagsFromPath(normalize('features/'))).toEqual([]);
  expect(extractTagsFromPath(normalize('features/@/'))).toEqual([]);

  // filename
  expect(extractTagsFromPath(normalize('features/@foo'))).toEqual(['@foo']);
  expect(extractTagsFromPath(normalize('features/@foo.feature'))).toEqual(['@foo']);
  expect(extractTagsFromPath(normalize('features/@foo.ts'))).toEqual(['@foo']);
  expect(extractTagsFromPath(normalize('features/@foo.steps.ts'))).toEqual(['@foo']);
  expect(extractTagsFromPath(normalize('features/.steps.ts'))).toEqual([]);
  expect(extractTagsFromPath(normalize('features/@'))).toEqual([]);
});
