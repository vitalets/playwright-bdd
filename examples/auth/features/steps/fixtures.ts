import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  // set types of your fixtures
};

export const test = base.extend<Fixtures>({
  storageState: async ({ $tags, storageState }, use) => {
    // reset storage state for features/scenarios with @noauth tag
    if ($tags.includes('@noauth')) {
      storageState = { cookies: [], origins: [] };
    }
    await use(storageState);
  },
});

export const { Given, When, Then } = createBdd(test);
