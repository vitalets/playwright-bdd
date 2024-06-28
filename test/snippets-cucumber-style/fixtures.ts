import { test as base, createBdd } from 'playwright-bdd';
import { TestInfo } from '@playwright/test';

type World = {
  testInfo: TestInfo;
};

export const test = base.extend<{ world: World }>({
  world: ({}, use, testInfo) => use({ testInfo }),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
