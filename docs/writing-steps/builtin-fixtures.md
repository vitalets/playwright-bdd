# Playwright-bdd fixtures
Playwright-bdd provides special fixtures for convenient development.

?> All Playwright-bdd fixtures are prefixed with `$` to avoid name collision with user-defined fixtures.

## `$test` and `$testInfo`
You can access [`test`](https://playwright.dev/docs/api/class-test) and [`testInfo`](https://playwright.dev/docs/api/class-testinfo) in step body using special fixtures `$test` and `$testInfo` respectively. It allows to:

  * change test timeout
  * conditionally skip tests
  * attach screenshots
  * ...all other actions via `testInfo` object

Example - skip test for `firefox`:
```ts
Given('I do something', async ({ browserName, $test }) => { 
  if (browserName === 'firefox') $test.skip();
  // ...
});
```

## `$step`
You can access current step info by special `$step` fixture.
Currently, it contains only step title, but can be extended in the future.

```ts
Given('I open url {string}', async ({ $step }, url: string) => { 
  console.log($step.title); // I open url "https://playwright.dev"
  // ...
});
```

#### Example
Popular use-case for `$step` fixture - additional matching by the step title.

Imagine you have a universal step to checks whether element visible or hidden: 
```ts
Then('element with text {string} should( not) be displayed', ...)
```
The pattern contains optional matching `should( not)`, that is [not available](https://github.com/cucumber/cucumber-expressions/issues/125) inside step function. The easiest way to additionally check for `( not)` is to use step title: 
```ts
Then('element with text {string} should( not) be displayed', async ({ page, $step }, text: string) => {
  const negate = /should not/.test($step.title);
  if (negate) {
    await expect(page.getByText(text)).toBeHidden();
  } else {
    await expect(page.getByText(text)).toBeVisible();
  }
});
```

## `$tags`
You can access current test tags by special `$tags` fixture:

```gherkin
@slow
Feature: Playwright site
    
    @jira:123
    Scenario: Check title
      Given I do something
      ...
```
In step definition:
```ts
Given('I do something', async ({ $tags }) => {
  console.log($tags); // outputs ["@slow", "@jira:123"]
});
```

The most powerful usage of `$tags` is in your custom fixtures.

##### Example 1
Run scenario only in Firefox if it has `@firefox` tag:
```gherkin
Feature: some feature
    
    @firefox
    Scenario: Runs only in Firefox
      ...
```
Custom fixture:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ firefoxOnly: void }>({
  firefoxOnly: [async ({ $tags }, use, testInfo) => {
    if ($tags.includes('@firefox')) testInfo.skip();
    await use();
  }, { auto: true }],
});
```

##### Example 2
Overwrite locale to `fi` if test has a `@LocaleFi` tag:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  locale: async ({ $tags, locale }, use) => {
    if ($tags.includes('@LocaleFi')) {
      locale = 'fi';
    }
    await use(locale);
  },
});
```

##### Example 3
Overwrite `viewport` for scenarios with `@mobile` tag:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  viewport: async ({ $tags, viewport }, use) => {
    if ($tags.includes('@mobile')) {
      viewport = { width: 375, height: 667 };
    }
    await use(viewport);
  }
});
```