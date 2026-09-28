# Playwright-BDD fixtures
Playwright-BDD provides built-in fixtures for convenient development.

?> All BDD fixtures are prefixed with `$` to avoid name collision with user-defined fixtures.

> See also [Accessing BDD fixtures in decorator steps](writing-steps/decorators.md#accessing-bdd-fixtures).

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

It exposes the following fields:

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Step title without the keyword, e.g. `I open url "https://playwright.dev"` |
| `docStringType` | `string \| undefined` | Media type of the doc string argument, if present. See [Doc strings](writing-steps/doc-strings.md). |
| `error` | `unknown \| undefined` | Error thrown by the current step body, available in `AfterStep`. It is `undefined` for successful steps. |
| `skip` | `function` | Skips the rest of the current step, while the scenario keeps running. See [Skipping a step](writing-steps/bdd-fixtures.md#skipping-a-step). |

```ts
Given('I open url {string}', async ({ $step }, url: string) => { 
  console.log($step.title); // I open url "https://playwright.dev"
  // ...
});
```

`$step.error` is mainly useful in [AfterStep hooks](writing-steps/hooks/step-hooks.md#afterstep). Use it instead of `$testInfo.status` when you need per-step failure handling.

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

#### Skipping a step
Call `$step.skip()` to skip the rest of the current step without skipping the whole scenario. Playwright stops the step, marks it as skipped, and the scenario carries on with the next step. It works like Playwright's [`testStepInfo.skip()`](https://playwright.dev/docs/api/class-teststepinfo#test-step-info-skip-1) and has the same signatures: `$step.skip()` and `$step.skip(condition, description)`.

For example, when the same scenarios run against a local environment and a deployed one, a step that checks something only available locally can skip itself on the deployed one:
```ts
Then('the mock server received one request', async ({ $step, request }) => {
  $step.skip(process.env.TARGET !== 'local', 'The mock server only runs locally');
  const res = await request.get('http://localhost:3001/requests');
  expect(await res.json()).toHaveLength(1);
});
```

In Cucumber reports the step gets the `SKIPPED` status, and the description becomes the step result message. You can also call `$step.skip()` in a [BeforeStep hook](writing-steps/hooks/step-hooks.md#beforestep) to skip a step before it runs.

?> `$step.skip()` requires Playwright 1.51 or newer. To skip the whole scenario, use [`$test.skip()`](writing-steps/bdd-fixtures.md#test-and-testinfo) instead.

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
