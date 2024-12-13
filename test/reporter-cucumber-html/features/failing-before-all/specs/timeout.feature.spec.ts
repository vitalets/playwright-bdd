import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    // Sometimes we still have 'BeforeAll Hooks' here, not 'my timeouted hook'.
    // It is when 'duration' != -1 -> no way to find exact timeouted item.
    /Hook "(my timeouted hook|BeforeAll Hooks)" failed/, // prettier-ignore
    'GivenAction 1',
  ]);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /("beforeAll" hook timeout of \d+ms exceeded)|(browser has been closed)|(Browser closed)/,
  ]);
});
