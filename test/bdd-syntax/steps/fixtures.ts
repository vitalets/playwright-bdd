import { test as base } from '../../../dist';

type Fixtures = {
  ctx: Record<string, string>;
  tagsFromCustomFixture: string[];
};

export const test = base.extend<Fixtures>({
  ctx: ({}, use) => use({}),
  tagsFromCustomFixture: ({ $tags }, use) => use($tags),
});
