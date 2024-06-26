import { Given as GivenC, When as WhenC, Then as ThenC } from '@cucumber/cucumber';
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  world: ({}, use, testInfo) => use({ testInfo }),
});

const isPlaywrightRun = Boolean(process.env.PLAYWRIGHT_BDD_CONFIG_DIR);

export const { Given, When, Then } = isPlaywrightRun
  ? createBdd(test, { worldFixture: 'world' })
  : { Given: GivenC, When: WhenC, Then: ThenC };

export const { Before, After } = createBdd(test, { worldFixture: 'world' });
