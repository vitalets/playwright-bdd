import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<object>({
  // ...
});

export const { Given, BeforeAll, AfterAll } = createBdd(test);
