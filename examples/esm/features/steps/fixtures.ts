import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  // set types of your fixtures
};

export const test = base.extend<Fixtures>({
  // add your fixtures
});

export const { Given, When, Then } = createBdd(test);
