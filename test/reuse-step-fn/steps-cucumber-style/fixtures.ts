import { TestInfo } from '@playwright/test';
import { test as base } from 'playwright-bdd';

type World = {
  todos: string[];
  testInfo: TestInfo;
};

export const test = base.extend<{ world: World }>({
  world: ({}, use, testInfo) => use({ todos: [], testInfo }),
});
