/**
 * Helpers to deal with Playwright test internal stuff.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/testType.ts
 */
import { test, Fixtures } from '@playwright/test';
import { Location } from '@playwright/test/reporter';
import { getSymbolByName } from '../utils';
import { TestTypeCommon } from './types';

type FixturesWithLocation = {
  fixtures: Fixtures;
  location: Location;
};

const testTypeSymbol = getSymbolByName(test, 'testType');

/**
 * Returns test fixtures using Symbol.
 */
function getTestFixtures(test: TestTypeCommon) {
  return getTestImpl(test).fixtures as FixturesWithLocation[];
}

function getTestImpl(test: TestTypeCommon) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return test[testTypeSymbol] as any;
}

export function isPlaywrightTestInstance(value: unknown): value is TestTypeCommon {
  return typeof value === 'function' && getTestImpl(value as TestTypeCommon);
}

/**
 * Returns true if test contains all fixtures of subtest.
 * - test was extended from subtest
 * - test is a result of mergeTests(subtest, ...)
 */
export function isTestContainsSubtest(test: TestTypeCommon, subtest: TestTypeCommon) {
  if (test === subtest) return true;
  const testFixtures = new Set(getTestFixtures(test).map((f) => locationToString(f.location)));
  return getTestFixtures(subtest).every((f) => {
    return testFixtures.has(locationToString(f.location));
  });
}

export function isTestContainsFixture(test: TestTypeCommon, fixtureName: string) {
  for (const { fixtures } of getTestFixtures(test)) {
    if (Object.hasOwn(fixtures, fixtureName)) return true;
  }
}

function locationToString({ file, line, column }: Location) {
  return `${file}:${line}:${column}`;
}
