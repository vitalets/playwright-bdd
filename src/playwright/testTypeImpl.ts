/**
 * Helpers to deal with Playwright test internal stuff.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/testType.ts
 */
import { test, Fixtures } from '@playwright/test';
import { Location } from '@playwright/test/reporter';
import { getSymbolByName } from '../utils';
import { TestTypeCommon } from './types';

export type FixturesWithLocation = {
  fixtures: Fixtures;
  location: Location;
};

const testTypeSymbol = getSymbolByName(test, 'testType');

/**
 * Returns test fixtures using Symbol.
 */
export function getTestFixtures(test: TestTypeCommon) {
  // @ts-expect-error testTypeSymbol is hidden prop
  return test[testTypeSymbol].fixtures as FixturesWithLocation[];
}

/**
 * Returns true if all fixtures of parent test found in child test.
 */
export function isParentChildTest(parent: TestTypeCommon, child: TestTypeCommon) {
  if (parent === child) return false;
  const childLocationsSet = new Set(
    getTestFixtures(child).map((f) => locationToString(f.location)),
  );
  return getTestFixtures(parent).every((f) => {
    return childLocationsSet.has(locationToString(f.location));
  });
}

function locationToString({ file, line, column }: Location) {
  return `${file}:${line}:${column}`;
}
