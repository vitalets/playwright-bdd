import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in fixture teardown', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses fixtureWithTimeoutInTeardown',
    'WhenAction 1',
    /Hook "(After Hooks|fixture: fixtureWithTimeoutInTeardown)" failed/,
  ]);
  // don't check screenshot as it's not reliable in timeouts
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /but tearing down "fixtureWithTimeoutInTeardown" ran out of time|Tearing down "fixtureWithTimeoutInTeardown" exceeded the test timeout/,
  ]);
});

test('timeout in step and in fixture teardown', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    'Givenstep that uses fixtureWithTimeoutInTeardown',
    /Hook "(After Hooks|fixture: fixtureWithTimeoutInTeardown)" failed/,
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
    /Hook "(my timeouted hook|After Hooks|fixture: \$afterEach)" failed/,
  ]);
  await expect(scenario.getErrors()).toContainText([
    /but tearing down "\$afterEach" ran out of time|Tearing down "\$afterEach" exceeded the test timeout/,
  ]);
});
