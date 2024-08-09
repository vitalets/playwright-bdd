import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  ctx: Record<string, string>;
  tagsFromCustomFixture: string[];
};

export const test = base.extend<Fixtures>({
  ctx: ({}, use) => use({}),
  tagsFromCustomFixture: ({ $tags }, use) => use($tags),
});

export const { Given, When, Then, Step } = createBdd(test);
