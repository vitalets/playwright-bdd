/**
 * MergeTests extracted from Playwright (modified).
 *
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/testType.ts#L252
 */
import { test, TestType, Fixtures } from '@playwright/test';
import { Location } from '@playwright/test/reporter';

/* eslint-disable @typescript-eslint/no-explicit-any */

type KeyValue = { [key: string]: any };
type TestTypeCommon = TestType<KeyValue, KeyValue>;
type FixturesWithLocation = {
  fixtures: Fixtures;
  location: Location;
};

const testTypeSymbol = getSymbolByName(test, 'testType');

export function mergeTests(...tests: TestTypeCommon[]) {
  let result = tests[0];
  for (let i = 1; i < tests.length; i++) {
    const resultFixtures = getTestFixtures(result);
    const testFixtures = getTestFixtures(tests[i]);
    // Filter out common ancestor fixtures.
    const newFixtures = testFixtures.filter(
      (theirs) => !resultFixtures.find((ours) => ours.fixtures === theirs.fixtures),
    );
    newFixtures.forEach((item) => (result = result.extend(item.fixtures)));
  }
  return result;
}

function getTestFixtures(test: TestTypeCommon) {
  return (test[testTypeSymbol] as any).fixtures as FixturesWithLocation[];
}

function getSymbolByName<T extends object>(target: T, name?: string) {
  const ownKeys = Reflect.ownKeys(target);
  const symbol = ownKeys.find((key) => key.toString() === `Symbol(${name})`);
  if (!symbol) {
    throw new Error(`Symbol "${name}" not found in target. ownKeys: ${ownKeys}`);
  }
  return symbol as keyof T;
}
