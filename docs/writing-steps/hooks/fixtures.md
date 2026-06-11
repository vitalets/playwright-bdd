# Fixtures

Although hooks are a well-known concept, Playwright offers a better alternative - [fixtures](https://playwright.dev/docs/test-fixtures#introduction). In most cases, fixtures can fully replace hooks and provide [many advantages](https://playwright.dev/docs/test-fixtures#with-fixtures). By default, always consider using fixtures.

#### Example of rewriting code from hooks to fixtures

Imagine a scenario with a step that requires user authorization:
```gherkin
Feature: Some feature

    Scenario: Some scenario
        Given I am an authorized user
```
So we need to wrap the scenario with sign-in / sign-out actions.

**In Cucumber** you can add a tag (e.g. `@auth`) to that scenario:
```gherkin
Feature: Some feature

    @auth
    Scenario: Some scenario
        Given I am an authorized user
```
And register `Before / After` hooks to run for that tag:

```ts
Before({ tags: '@auth' }, async function () {
  // do sign-in
});

After({ tags: '@auth' }, async function () {
  // do sign-out
});
```

**In Playwright** you can create the following `auth` fixture:
```ts
export const test = base.extend({
  auth: async ({}, use) => {
    // do sign-in
    await use({ username: 'some user' });
    // do sign-out
  }
});
```
and use that `auth` fixture in the step:
```ts
Given('I am an authorized user', async ({ auth }) => {
  console.log('step for authorized user', auth.username);
});
```
Playwright will automatically wrap test code with user sign-in and sign-out.

The benefits of using fixtures:
- fixture is executed only when actually used
- no extra tags
- fixture code is reusable in other features
