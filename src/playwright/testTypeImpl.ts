/**
 * Helpers to deal with Playwright test internal stuff.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/testType.ts
 */
import { test, Fixtures } from '@playwright/test';
import { Location } from '@playwright/test/reporter';
import { getSymbolByName } from '../utils';
import { TestTypeCommon } from './types';
import { bddFixtures } from '../run/bddFixtures';
import { exit } from '../utils/exit';

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

/**
 * Run step with location pointing to Given, When, Then call.
 */
// eslint-disable-next-line max-params
export async function runStepWithCustomLocation(
  test: TestTypeCommon,
  stepText: string,
  location: Location,
  body: () => unknown,
) {
  const testInfo = test.info();

  // See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/testType.ts#L221
  // @ts-expect-error _runAsStep is hidden from public
  return testInfo._runAsStep({ category: 'test.step', title: stepText, location }, async () => {
    return await body();
  });
}

/**
 * Returns true if this `test` function has all the fixtures we need
 */
export function assertHasBddFixtures(test: TestTypeCommon) {
  const allDefinedFixtures = new Set(
    getTestFixtures(test)
      .map(({ fixtures }) => Object.keys(fixtures || {}))
      .flat(),
  );

  const missingFixtures = Object.keys(bddFixtures).filter(
    (name) => !allDefinedFixtures.has(name),
  );
  if (missingFixtures.length > 0) {
    exit(
      `createBdd() should use test extended from "playwright-bdd" Missing fixtures: ${missingFixtures.join(
        ', ',
      )}`,
    );
  }
}
