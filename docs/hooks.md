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

export const test = base.extend<
  { Before: void, After: void },
  { BeforeAll: void, AfterAll: void }
>({
  Before: [async ({}, use, testInfo) => {
    // run Before hooks
    await use();
  }, { auto: true }],
  After: [async ({}, use, testInfo) => {
    await use();
    // run After hooks
  }, { auto: true }],  
  BeforeAll: [async ({}, use, workerInfo) => {
    // run BeforeAll hooks
    await use();
  }, { auto: true, scope: 'worker' }],
  AfterAll: [async ({}, use, workerInfo) => {
    await use();
    // run AfterAll hooks
  }, { auto: true, scope: 'worker' }],  
});
```

**Example**: use `Before` hook to log every test title:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ Before: void }>({
  Before: [async ({}, use, testInfo) => {
    console.log('Test title', testInfo.title); // <- before hook
    await use();
  }, { auto: true }],
});
```

## Conditional hooks

You can run `Before / After` hooks conditionally by tags, similar to Cucumber [tagged hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md#tagged-hooks). 
Use `$tags` fixture:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ Before: void }>({
  Before: [async ({ $tags }, use, testInfo) => {
    if ($tags.includes('@logme')) {
      console.log('Test title', testInfo.title);
    }
    await use();
  }, { auto: true }],
});
```

## Access to World

You can access World instance in `Before / After` hooks. 
Use `$bddWorld` fixture:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ Before: void }>({
  Before: [async ({ $bddWorld }, use, testInfo) => {
    await $bddWorld.setup();
    await use();
  }, { auto: true }],
});
```

> Note that there is no access to `$bddWorld` in **worker-level hooks** because World is created for every test. Here is a [discussion](https://github.com/cucumber/cucumber-js/issues/1393) in Cucumber repo.