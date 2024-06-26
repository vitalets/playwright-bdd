import { test as base, createBdd } from 'playwright-bdd';
import { TestInfo } from '@playwright/test';

type World = {
  testInfo: TestInfo;
  tags: string[];
  [key: string]: unknown;
};

export const test = base.extend<{ world: World }>({
  world: ({ $tags }, use, testInfo) => use({ testInfo, tags: $tags }),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
