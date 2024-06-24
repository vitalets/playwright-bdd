import { test as base } from 'playwright-bdd';

class MyFixture {
  foo = 42;
}

export const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({}, use) => await use(new MyFixture()),
});
