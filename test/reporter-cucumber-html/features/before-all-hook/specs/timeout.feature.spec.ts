import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    // Sometimes we still have 'BeforeAll Hooks' here, not 'my timeouted hook'.
    // It is when 'duration' != -1 -> no way to find exact timeouted item.
    /BeforeAll(?:: (my timeouted hook|BeforeAll Hooks))?/, // prettier-ignore
    'Given Action 1',
  ]);
  await expect(scenario.getErrors()).toContainText([
    // New reporter only shows callstack for beforeAll hook timeouts (no message text)
    /timeout\.feature\.spec/,
  ]);
});
