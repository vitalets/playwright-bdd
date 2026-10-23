import { setTimeout } from 'node:timers/promises';
import { createBdd, test as base } from 'playwright-bdd';
import { Fixture, Given as DecoratorGiven } from 'playwright-bdd/decorators';

@Fixture('resource')
export class Resource {
  @DecoratorGiven('a decorator step times out', { timeout: 50 })
  async run() {
    await neverFinishes();
  }
}

export const test = base.extend<{ resource: Resource; world: object }>({
  resource: ({}, use) => use(new Resource()),
  world: ({}, use) => use({}),
});

const { Given, BeforeStep, AfterStep } = createBdd(test);
const { Given: CucumberGiven } = createBdd(test, { worldFixture: 'world' });

Given('a Playwright step times out', { timeout: 50 }, async () => {
  await neverFinishes();
});

CucumberGiven('a Cucumber step times out', { timeout: 50 }, async function () {
  await neverFinishes();
});

Given('a step completes within its timeout', { timeout: 1_000 }, async () => {
  await setTimeout(10);
});

Given('a step has no timeout option', async () => {
  await setTimeout(100);
});

Given('a step has zero timeout', { timeout: 0 }, async () => {
  await setTimeout(100);
});

Given('a step has a slow hook', { timeout: 50 }, async () => {});
BeforeStep({ tags: '@slow-before-step-hook' }, async () => {
  await neverFinishes();
});
AfterStep({ tags: '@slow-after-step-hook' }, async () => {
  await neverFinishes();
});

BeforeStep({ tags: '@before-step-hook-timeout', timeout: 10 }, async () => {
  await neverFinishes();
});
Given('a step retains its hook timeout', { timeout: 1_000 }, async () => {});

// An unresolved promise exercises timeouts without leaving delayed work running after failure.
function neverFinishes() {
  return new Promise<void>(() => {});
}
