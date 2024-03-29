/**
 * Helpers to deal with Playwright test internal stuff.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/testType.ts
 */
import { test, Fixtures, TestInfo } from '@playwright/test';
import { Location } from '@playwright/test/reporter';
import { getSymbolByName } from '../utils';
import { TestTypeCommon } from './types';
import { playwrightVersion } from './utils';

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

// Partial copy of Playwright's TestStepInternal
// See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L32
interface TestStepInternal {
  title: string;
  category: 'hook' | 'fixture' | 'test.step' | string;
  location?: Location;
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
  // Since PW 1.43 testInfo._runAsStep was replaced with a more complex logic.
  // To run step with a custom location, we hijack testInfo._addStep()
  // so that it appends location for the bdd step calls.
  // Finally we call test.step(), that internally invokes testInfo._addStep().
  // See: https://github.com/microsoft/playwright/issues/30160
  // See: https://github.com/microsoft/playwright/blob/release-1.43/packages/playwright/src/common/testType.ts#L262
  // See: https://github.com/microsoft/playwright/blob/release-1.43/packages/playwright/src/worker/testInfo.ts#L247
  if (playwrightVersion >= '1.39.0') {
    const testInfo = test.info() as TestInfo & {
      _addStep: (data: TestStepInternal) => unknown;
    };

    // here we rely on that testInfo._addStep is called synchronously in test.step()
    const origAddStep = testInfo._addStep;
    testInfo._addStep = function (data: TestStepInternal) {
      data.location = location;
      testInfo._addStep = origAddStep;
      return origAddStep.call(this, data);
    };

    return test.step(stepText, body);
  } else {
    const testInfo = test.info() as TestInfo & {
      // testInfo._runAsStep is not public
      // See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/testType.ts#L221
      _runAsStep: (data: TestStepInternal, fn: () => unknown) => unknown;
    };
    return testInfo._runAsStep({ category: 'test.step', title: stepText, location }, async () => {
      return await body();
    });
  }
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

function locationToString({ file, line, column }: Location) {
  return `${file}:${line}:${column}`;
}
