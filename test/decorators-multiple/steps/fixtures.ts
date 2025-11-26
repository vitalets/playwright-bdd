import { test as base } from 'playwright-bdd';
import {
  BasicPage,
  MixedPage,
  TaggedPage,
  BasePage,
  ChildPage,
  RegexpPage,
  SinglePage,
} from './poms';

type Fixtures = {
  log: string[];
  basicPage: BasicPage;
  mixedPage: MixedPage;
  taggedPage: TaggedPage;
  basePage: BasePage;
  childPage: ChildPage;
  regexpPage: RegexpPage;
  singlePage: SinglePage;
};

export const test = base.extend<Fixtures>({
  log: async ({}, use) => {
    const log: string[] = [];
    await use(log);
  },
  basicPage: async ({ log }, use) => use(new BasicPage(log)),
  mixedPage: async ({ log }, use) => use(new MixedPage(log)),
  taggedPage: async ({ log }, use) => use(new TaggedPage(log)),
  basePage: async ({ log }, use) => use(new BasePage(log)),
  childPage: async ({ log }, use) => use(new ChildPage(log)),
  regexpPage: async ({ log }, use) => use(new RegexpPage(log)),
  singlePage: async ({ log }, use) => use(new SinglePage(log)),
});
