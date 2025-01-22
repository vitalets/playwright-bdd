# Playwright-BDD fixtures
Playwright-BDD provides built-in fixtures for convenient development.

?> All Playwright-BDD fixtures are prefixed with `$` to avoid name collision with user-defined fixtures.

## `$test` and `$testInfo`
You can access [`test`](https://playwright.dev/docs/api/class-test) and [`testInfo`](https://playwright.dev/docs/api/class-testinfo) in step body using special fixtures `$test` and `$testInfo` respectively. This allows you to:

  * change test timeout
  * conditionally skip tests
  * attach screenshots
  * perform all other actions via the `testInfo` object

Example - skip test for `firefox`:
```ts
Given('I do something', async ({ browserName, $test }) => { 
  if (browserName === 'firefox') $test.skip();
  // ...
});
```

## `$step`
You can access current step info using the special `$step` fixture.
Currently, it contains only the step title but can be extended in the future.

```ts
Given('I open url {string}', async ({ $step }, url: string) => { 
  console.log($step.title); // I open url "https://playwright.dev"
  // ...
});
```

#### Example
A popular use-case for the `$step` fixture is additional matching by the step title.

Imagine you have a universal step to check whether an element is visible or hidden: 
```ts
Then('element with text {string} should( not) be displayed', ...)
```
The pattern contains optional matching `should( not)`, which is [not available](https://github.com/cucumber/cucumber-expressions/issues/125) inside the step function. The easiest way to additionally check for `( not)` is to use the step title: 
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
You can access current test tags using the special `$tags` fixture:

```gherkin
@slow
Feature: Playwright site
    
    @jira:123
    Scenario: Check title
      Given I do something
      ...
```
In the step definition:
```ts
Given('I do something', async ({ $tags }) => {
  console.log($tags); // outputs ["@slow", "@jira:123"]
});
```

The most powerful usage of `$tags` is in your custom fixtures.

##### Example 1: Run test in a specific browser

Imagine you want to run scenario only in Firefox, if there is a `@firefox` tag:
```gherkin
Feature: some feature
    
    @firefox
    Scenario: Runs only in Firefox
      ...
```

Setup custom fixture, that checks `$tags` and skips the test in non-firefox browser:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ firefoxOnly: void }>({
  firefoxOnly: [
    async ({ $tags, defaultBrowserType }, use, testInfo) => {
      if ($tags.includes('@firefox') && defaultBrowserType !== 'firefox') {
        testInfo.skip();
      }
      await use();
    },
    { auto: true },
  ],
});
```

##### Example 2: Set locale for a test
Overwrite the locale to `fi` if the test has a `@LocaleFi` tag:
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

##### Example 3: Switch to mobile viewport for a test
Overwrite the `viewport` for scenarios with the `@mobile` tag:
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