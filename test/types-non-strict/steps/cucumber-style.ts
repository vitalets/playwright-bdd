import { test as base, createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

class World {}

const test = base.extend<{ world: World }>({
  world: async ({}, use) => await use(new World()),
});

const { Given } = createBdd(test, { worldFixture: 'world' });

Given('some step', async function () {
  expectTypeOf(this).toEqualTypeOf<World>();
});
