import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "my timeouted hook" failed: ${normalize('features/failing-before-all/steps.ts')}:`, // prettier-ignore
    'GivenAction 1',
  ]);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /("beforeAll" hook timeout of \d+ms exceeded)|(browser has been closed)|(Browser closed)/,
  ]);
});
