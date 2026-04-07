import { test, createBdd } from 'playwright-bdd';
import { TestInfo } from '@playwright/test';

export const testWithWorld = test.extend<{ world: { testInfo: TestInfo } }>({
  world: ({}, use, testInfo) => use({ testInfo }),
});

const { Given, BeforeAll } = createBdd(testWithWorld, { worldFixture: 'world' });

BeforeAll({ name: 'setup all' }, async function () {
  // no-op: just needs to appear in the report
});

Given('a step that passes', function () {
  // no-op
});

Given('a step that passes the second time', function () {
  if (this.testInfo.retry < 1) {
    throw new Error('Failing on first attempt');
  }
});
