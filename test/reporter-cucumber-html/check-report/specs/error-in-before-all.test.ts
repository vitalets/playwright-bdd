import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.describe('error in anonymous before all hook', () => {
  test.use({ featureUri: 'error-in-before-all/anonymous.feature' });

  test('scenario 1', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText([
      `Hook "BeforeAll hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
      'GivenAction 1',
      'Download trace',
    ]);
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(1);
    await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
  });

  test('scenario 2', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText([
      `Hook "BeforeAll hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
      'GivenAction 2',
      'Download trace',
    ]);
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(1);
    await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
  });
});

test.describe('error in named before all hook', () => {
  test.use({ featureUri: 'error-in-before-all/named.feature' });

  test('scenario 1', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText([
      `Hook "my hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
      'GivenAction 1',
      'Download trace',
    ]);
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(1);
    await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
  });
});
