import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

import { getPackageVersion } from '../../../../src/utils';

// 'Download trace' appears in the report in case of error in before all hook since 1.42
const pwVersion = getPackageVersion('@playwright/test');
const hasDownloadTrace = pwVersion >= '1.42.0';

test.describe('error in anonymous before all hook', () => {
  test.use({ featureUri: 'error-in-before-all/anonymous.feature' });

  test('scenario 1', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText(
      [
        `Hook "BeforeAll hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
        'GivenAction 1',
        hasDownloadTrace ? 'Download trace' : '',
      ].filter(Boolean),
    );
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(1);
    await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
  });

  test('scenario 2', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText(
      [
        `Hook "BeforeAll hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
        'GivenAction 2',
        hasDownloadTrace ? 'Download trace' : '',
      ].filter(Boolean),
    );
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(1);
    await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
  });
});

test.describe('error in named before all hook', () => {
  test.use({ featureUri: 'error-in-before-all/named.feature' });

  test('scenario 1', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText(
      [
        `Hook "my hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
        'GivenAction 1',
        hasDownloadTrace ? 'Download trace' : '',
      ].filter(Boolean),
    );
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(1);
    await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
  });
});

test.describe('error in worker fixture setup', () => {
  test.use({ featureUri: 'error-in-before-all/fixture.feature' });

  test('scenario 1', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText([
      `Hook "fixture: workerFixtureWithErrorInSetup" failed: ${normalize('features/error-in-before-all/fixtures.ts')}:`,
      'GivenAction 1',
      'Givenstep that uses workerFixtureWithErrorInSetup',
      'Download trace',
    ]);
    await expect(scenario.getSteps('failed')).toHaveCount(1);
    await expect(scenario.getSteps('skipped')).toHaveCount(2);
    await expect(scenario.getErrors()).toContainText(['error in worker fixture setup']);
  });
});

test.describe('timeout in before-all hook', () => {
  test.use({ featureUri: 'error-in-before-all/timeout.feature' });

  test('scenario 1', async ({ scenario }) => {
    await expect(scenario.getSteps()).toContainText([
      `Hook "BeforeAll hook" failed: ${normalize('features/error-in-before-all/steps.ts')}:`, // prettier-ignore
      'GivenAction 1',
    ]);
    await expect(scenario.getErrors()).toContainText([
      // here can be different error messages
      /("beforeAll" hook timeout of \d+ms exceeded)|(browser has been closed)|(Browser closed)/,
    ]);
  });
});
