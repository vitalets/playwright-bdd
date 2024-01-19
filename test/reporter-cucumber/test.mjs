/**
 * Runs Playwright for each dir in features/* and validates messages report.
 * Expected reports are taken from 2 places:
 * 1. Cucumber tests
 * - https://github.com/cucumber/cucumber-js/tree/main/features/fixtures/formatters
 * 2. Cucumber compatibility tests (CCK)
 * - https://github.com/cucumber/compatibility-kit
 *
 * Run single feature:
 * node test/setup.mjs && node test/reporter-compatibility/test.mjs passed-scenario
 * node test/setup.mjs && node test/reporter-compatibility/test.mjs cck/minimal
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../helpers.mjs';
import get from 'lodash.get';

const testDir = new TestDir(import.meta);

const onlyFeatureDir = process.argv[2];

test(testDir.name, async () => {
  const dirs = onlyFeatureDir ? [onlyFeatureDir] : readFeatureDirs();
  for (const dir of dirs) {
    await checkFeature(dir);
  }
});

function readFeatureDirs() {
  return fg
    .sync('**', {
      cwd: fileURLToPath(testDir.getAbsPath('features')),
      deep: 2,
      onlyDirectories: true,
    })
    .filter((dir) => dir !== 'cck');
}

/**
 * Checks feature.
 * featureDir - path to feature dir inside ./features,
 * e.g. 'passed-scenario' or 'cck/minimal'
 */
async function checkFeature(featureDir) {
  const fullFeatureDir = `test/${testDir.name}/features/${featureDir}`;
  const featureName = featureDir.split(path.sep).pop();
  const isCCK = featureDir.startsWith('cck');

  execPlaywrightTest(testDir.name, { env: { FEATURE_DIR: featureDir } });

  const expected = isCCK
    ? getMessagesFromFile(`${fullFeatureDir}/${featureName}.feature.ndjson`)
    : (await import(`./features/${featureDir}/${featureName}.message.json.js`)).default;

  const actual = getMessagesFromFile(`${fullFeatureDir}/report.ndjson`);
  const expectedShape = buildShape(expected);
  const actualShape = buildShape(actual);

  expect(actualShape).toStrictEqual(expectedShape);
}

/**
 * These paths are ignored when comapring messages.
 */
function isIgnorePath(pathStr, isCCK) {
  const ignorePaths = [
    isCCK ? '' : 'meta', // there is not meta message in cucumber test files
    'meta.ci',
    'stepDefinition',
    'testCase.testSteps.#.stepDefinitionIds',
  ].filter(Boolean);
  return ignorePaths.some((prefix) => pathStr.startsWith(prefix));
}

/**
 * These paths are compared by values.
 */
function isValuePath(pathStr) {
  const valuePaths = [
    'source.data', // prettier-ignore
    'pickle.name',
    'pickle.steps.#.text',
  ];
  return valuePaths.some((prefix) => pathStr.startsWith(prefix));
}

/**
 * Stringifies object path, replaces index with #.
 * E.g. ['pickle', 'steps', '0', 'type'] -> 'pickle.steps.#.type'
 */
function getPathStr(path) {
  return path.map((v) => (/^\d+$/.test(v) ? '#' : v)).join('.');
}

/**
 * Builds 'object shape' - an object with all paths of objects in all messages.
 * Used for validating reports.
 */
function buildShape(messages, isCCK) {
  const obj = {};
  messages.forEach((m) => {
    getAllPaths(m).forEach((path) => {
      const pathStr = getPathStr(path);
      const curVal = obj[pathStr];
      if (isIgnorePath(pathStr, isCCK)) return;
      if (isValuePath(pathStr)) {
        const newVal = get(m, path);
        obj[pathStr] = curVal ? curVal.concat([newVal]).sort() : [newVal];
      } else {
        obj[pathStr] = curVal ? curVal + 1 : 1;
      }
    });
  });

  return obj;
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

/**
 * Returns all possible paths in object.
 * See: https://stackoverflow.com/questions/37759768/get-all-paths-in-json-object
 */
function getAllPaths(o) {
  if (!o || typeof o !== 'object') return [];

  const paths = [];
  const stack = [{ obj: o, path: [] }];

  while (stack.length > 0) {
    const { obj, path } = stack.pop();

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        stack.push({ obj: obj[key], path: [...path, key] });
      }
    } else {
      paths.push(path);
    }
  }

  return paths;
}
