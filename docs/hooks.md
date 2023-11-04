# Hooks

Hooks are functions that run before/after some parts of test execution:

* `BeforeAll` / `AfterAll` - run before/after **every worker**
* `Before` / `After` - run before/after **every scenario**

> If you need to run code before/after **overall test execution** consider Playwright's [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)

Although hooks is a popular concept, Playwright offers a better alternative - [fixtures](https://playwright.dev/docs/test-fixtures#introduction). In most cases fixtures can fully replace hooks and provide [a lot of advantages](https://playwright.dev/docs/test-fixtures#with-fixtures). By default always consider to use fixtures.

Currently `playwright-bdd` does not support hooks out-of-box.
But you can implement hooks on your side using auto-fixtures. 

Here is a general template to define hooks via fixtures:
```ts
import { test as base } from 'playwright-bdd';

export const testWithHooks = base.extend<
  { scenarioHooks: void },
  { workerHooks: void }
>({
  scenarioHooks: [async ({ page }, use, testInfo) => {
    // run Before hooks
    await use();
    // run After hooks
  }, { auto: true }],
  workerHooks: [async ({ browser }, use, workerInfo) => {
    // run BeforeAll hooks
    await use();
    // run AfterAll hooks
  }, { auto: true, scope: 'worker' }],
});
```

**Example #1**: implementation of `Before` hook to log every test title:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ scenarioHooks: void }>({
  scenarioHooks: [async ({ page }, use, testInfo) => {
    console.log('Test title', testInfo.title); // <- before hook
    await use();
  }, { auto: true }],
});
```

**Example #2**: implementation of `BeforeAll` hook to authenticate user:

You can define hook itself in a separate file `hooks.ts`:
```ts
import { Browser, WorkerInfo } from '@playwright/test';

export async function authenticateUser(browser: Browser, workerInfo: WorkerInfo) {
  // authenticate user before all scenarios
}
```

Then use it in `test.extend`:
```ts
import { test as base } from 'playwright-bdd';
import { authenticateUser } from './hooks.ts';

export const test = base.extend<{}, { workerHooks: void }>({
  workerHooks: [async ({ browser }, use, workerInfo) => {
    await authenticateUser(browser, workerInfo); // <- before all hook
    await use();
  }, { auto: true, scope: 'worker' }],
});
```

## Conditional hooks

You can run scenario-level hooks conditionally by tags, similar to Cucumber [tagged hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md#tagged-hooks). 
Use `$tags` fixture:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ scenarioHooks: void }>({
  scenarioHooks: [async ({ $tags }, use, testInfo) => {
    if ($tags.includes('@logme')) {
      console.log('Test title', testInfo.title);
    }
    await use();
  }, { auto: true }],
});
```

## Access to World

You can access World instance in scenario-level hooks. 
Use `$bddWorld` fixture:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ scenarioHooks: void }>({
  scenarioHooks: [async ({ $bddWorld }, use, testInfo) => {
    await $bddWorld.setup();
    await use();
  }, { auto: true }],
});
```

> Note that there is no access to `$bddWorld` in **worker-level hooks** because World is re-created for every test. Here is a [discussion](https://github.com/cucumber/cucumber-js/issues/1393) in Cucumber repo.