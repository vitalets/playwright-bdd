import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';
import { getPackageVersion } from '../../../../../src/utils';

const playwrightVersion = getPackageVersion('@playwright/test');

test('timeout in fixture setup', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses fixtureWithTimeoutInSetup',
    'WhenAction 1',
  ]);
  // 1. position of error message sometimes appears in After Hooks, so check it separately
  // 2. here can be different error messages
  await expect(scenario.getSteps()).toContainText([/Hook "(.+)" failed/]);
  // screenshot position changes between PW versions, so check it separately
  await expect(scenario.getSteps()).toContainText(['screenshot']);
  // sometimes error is the following:
  // "browser.newContext: Target page, context or browser has been closed"
  // in that case there are two errors in test report.
  expect(await scenario.getSteps('failed').count()).toBeGreaterThan(0);
  await expect(scenario.getSteps('skipped')).toHaveCount(3);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /(Test timeout of \d+ms exceeded while setting up "fixtureWithTimeoutInSetup")|(browser has been closed)|(Browser closed)|(Page closed)/,
  ]);
});

test('timeout in before hook', async ({ scenario }) => {
  // In PW 1.41 sometime none of before hook entries has error or duretion -1,
  // so timeout error is attachmed to After Hooks.
  test.skip(playwrightVersion < '1.42.0');
  await expect(scenario.getSteps()).toContainText([
    // sometimes we still have 'BeforeEach Hooks|Before Hooks' here, not 'my timeouted hook',
    // when 'duration' is not -1, we can't find timeouted item.
    /Hook "(my timeouted hook|BeforeEach Hooks|Before Hooks|fixture: \$beforeEach)" failed:/, // prettier-ignore
    'GivenAction 1',
  ]);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /(Test timeout of \d+ms exceeded while running "beforeEach" hook)|(browser has been closed)|(Browser closed)|(Page closed)/,
  ]);
});
