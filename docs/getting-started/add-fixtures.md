# Add fixtures

As your tests grow, you will most likely need some Playwright [fixtures](https://playwright.dev/docs/test-fixtures). This means you will use a custom `test` instance, created with `test.extend()`. For such cases, you should pass the custom test instance into the `createBdd()` function to have access to all your fixtures inside step definitions.

## 1. Create `fixtures.ts`

Create a separate `fixtures.ts` file, define your custom fixtures and export `Given / When / Then`: 

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  myFixture: string; // <-- custom fixture type
};

export const test = base.extend<Fixtures>({
  myFixture: async ({}, use) => { // <-- custom fixture implementation
    await use('foo');
  }
});

export const { Given, When, Then } = createBdd(test); // <-- export Given / When / Then
```

> Make sure to export the `test` variable, because it is used in generated test files.

## 2. Import `Given / When / Then` in step files

Now you can write step definitions with custom fixtures:

```ts
// steps.ts
import { Given, When, Then } from './fixtures';

Given('My step', async ({ myFixture }) => { // <-- step uses `myFixture`
  // ...
});
```