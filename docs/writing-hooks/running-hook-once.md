# Running Hook Once

`BeforeAll` / `AfterAll` run **once per worker**, not once for the entire test run. This may not be what you want. For example, if you populate a database with test data, there’s no need to repopulate it in every worker:

```ts
import { BeforeWorker } from './fixtures';

BeforeWorker(async () => {
  await populateDatabase(); // <-- runs in every worker
});
```

To run code inside a hook exactly once, you can use [@global-cache/playwright](https://github.com/vitalets/global-cache). It lets you cache and reuse any serializable data across all workers:

```ts
import { BeforeWorker } from './fixtures';
import { globalCache } from '@global-cache/playwright';

BeforeWorker(async () => {
  await globalCache.get('populate-db', async () => {
    await populateDatabase(); // <-- runs once
  });
});
```

> See the global-cache [README](https://github.com/vitalets/global-cache) for setup instructions.

You can also use this approach in `BeforeScenario` hooks to store data and [reuse](writing-steps/passing-data-between-steps.md) it in steps:

```ts
BeforeScenario(async ({ ctx }) => {
  ctx.userIds = await globalCache.get('user-ids', async () => {
    const userIds = await populateDatabase();
    return userIds;
  });
});
```

You can use Global Cache in fixtures as well. For example, wrap the code in `storageState` fixture to authenticate only when needed and cache for 1 hour:

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';
import { globalCache } from '@global-cache/playwright';

export const test = base.extend({
  storageState: async ({ storageState, browser }, use, testInfo) => {
    // Skip authentication for scenarios tagged @no-auth
    if (testInfo.tags.includes('@no-auth')) return use(storageState);

    // Get auth state once and cache it for 1 hour
    const authState = await globalCache.get('auth-state', { ttl: '1 hour' }, async () => {
      const loginPage = await browser.newPage();
      // ...authenticate
      return loginPage.context().storageState();
    });

    await use(authState);
  },
});

export const { Given, When, Then } = createBdd(test);
```

This can significantly speed up your tests in fully parallel and sharded runs.
