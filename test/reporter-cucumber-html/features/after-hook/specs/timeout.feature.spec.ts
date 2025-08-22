import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

// pw 1.53 -> "fixture: " prefix removed
// pw 1.55 -> format changed to "Fixture "name""
const fixtureTimeoutRegexp =
  /Hook "(After Hooks|AfterEach Hooks|.*fixtureWithTimeoutInTeardown.*)" failed/i;

test('timeout in fixture teardown', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses fixtureWithTimeoutInTeardown',
    'WhenAction 1',
    fixtureTimeoutRegexp,
  ]);
  // don't check screenshot as it's not reliable in timeouts
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /tearing down "fixtureWithTimeoutInTeardown"/i,
  ]);
});

test('timeout in step and in fixture teardown', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    'Givenstep that uses fixtureWithTimeoutInTeardown',
    fixtureTimeoutRegexp,
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(4);
  // Don't check exact failed steps, it depends on PW version.
  // - In modern PW versions (e.g. 1.49) timeouted fixture has 'error' field, we can find it.
  //   It shows:
  //   (1) Hook "fixture: fixtureWithTimeoutInTeardown" failed
  //   (2) Hook "After Hooks" failed: Test timeout of 1500ms exceeded
  // - In older PW versions there is no 'error' field in timeouted fixture, we can't find it.
  //   It shows only fallback:
  //   (1) Hook "After Hooks" failed: Test timeout of 1500ms exceeded
  await expect(scenario.getErrors()).toContainText([
    /Test timeout of \d+ms exceeded|Tearing down "fixtureWithTimeoutInTeardown" exceeded the test timeout/,
  ]);
});

test('timeout in after hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Givenstep with page',
    // sometimes we still have "After Hooks" here,
    // when duration = -1 is not in after hooks, and we cant detect which fixture timed out
    /Hook "(my timeouted hook|After Hooks|AfterEach Hooks)" failed/i,
  ]);
  await expect(scenario.getErrors()).toContainText([/Test timeout of \d+ms exceeded/]);
});
