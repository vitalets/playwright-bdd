import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

class World {
  constructor(public page: Page) {}
}

export const test = base.extend<{ world: World }>({
  world: ({ page }, use) => use(new World(page)),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
