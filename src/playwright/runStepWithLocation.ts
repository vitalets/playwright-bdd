/**
 * Run Playwright step with custom location.
 */

import { TestInfo } from '@playwright/test';
import { Location } from '@playwright/test/reporter';
import { TestTypeCommon } from './types';
import { playwrightVersion } from './utils';

// Partial copy of Playwright's TestStepInternal
// See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L32
interface TestStepInternal {
  title: string;
  category: 'hook' | 'fixture' | 'test.step' | string;
  location?: Location;
}

// eslint-disable-next-line max-params
export async function runStepWithLocation(
  test: TestTypeCommon,
  stepText: string,
  location: Location,
  body: () => unknown,
) {
  // PW 1.48 introduced official way to run step with location.
  // See: https://github.com/microsoft/playwright/issues/30160
  if (playwrightVersion >= '1.48.0') {
    // Earlier PW versions do not support 3rd argument in test.step
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return test.step(stepText, body, { location });
  } else {
    // To run step with a custom location, we hijack testInfo._addStep()
    // so that it appends location for the bdd step calls.
    // Finally we call test.step(), that internally invokes testInfo._addStep().
    // See: https://github.com/microsoft/playwright/blob/release-1.43/packages/playwright/src/common/testType.ts#L262
    // See: https://github.com/microsoft/playwright/blob/release-1.43/packages/playwright/src/worker/testInfo.ts#L247
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
  }
}
