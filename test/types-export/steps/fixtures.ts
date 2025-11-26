import { test as base, createBdd } from 'playwright-bdd';

class MyFixture {}

export const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({}, use) => await use(new MyFixture()),
});

export const { Given, When, Then, Before, BeforeAll } = createBdd(test);
