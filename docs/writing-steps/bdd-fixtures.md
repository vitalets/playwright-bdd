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
| `info` | `Omit<TestStepInfo, 'skip'>` | Native Playwright step info, available during the step body and step hooks. Members follow your installed Playwright version. |
| `attach` | `TestStepInfo['attach']` | Attach a file or value to the current BDD step. |
| `skip` | `TestStepInfo['skip']` | Skip the current BDD step and continue the scenario. |

```ts
Given('I open url {string}', async ({ $step }, url: string) => { 
  console.log($step.title); // I open url "https://playwright.dev"
  // ...
});
```

`$step.error` is mainly useful in [AfterStep hooks](writing-steps/hooks/step-hooks.md#afterstep). Use it instead of `$testInfo.status` when you need per-step failure handling.

### Native step info and attachments

`$step.info` exposes [Playwright's TestStepInfo](https://playwright.dev/docs/api/class-teststepinfo), except `skip()`. Its types come from your installed Playwright version: newer members such as `titlePath` and `annotations` are available when that version supports them. No newer Playwright version is required to use the basic step API.

Use `$step.attach()` as a convenience alias for `$step.info.attach()`:

```ts
Then('the response is valid', async ({ $step }) => {
  await $step.attach('response', { body: 'response details', contentType: 'text/plain' });
  await $step.info.attach('log', { path: 'logs/request.log' });
});
```

Both forms attach to the enclosing BDD step, including when called from a named `BeforeStep` or `AfterStep` hook. `$step.info` and `$step.attach()` are available only during BDD step execution, including step hooks; using them in scenario hooks or fixture setup/teardown throws an error.

### Skipping step dynamically

Use `$step.skip()` to stop the current step, mark it as skipped, and continue with the next step in the scenario:

```ts
Then('the payment mock received one charge', async ({ $step }) => {
  $step.skip(process.env.TARGET !== 'local', 'The payment mock only runs locally');
  // Check the mock...
});
```

Call `$step.skip()` without arguments to skip unconditionally, or `$step.skip(condition, reason)` to skip conditionally. A false condition continues execution normally.

- In `BeforeStep`, skipping stops subsequent before-hooks and bypasses the body and after-hooks. This also works with named hooks.
- In the step body, skipping still runs `AfterStep` hooks, with `$step.error` unset. A real after-hook failure fails the step.
- Calling `$step.skip()` in `AfterStep` or outside active step execution throws an error.

`$step.info.skip()` is intentionally omitted from TypeScript types. Use `$step.skip()` instead to correctly skip BDD steps.

Reports display the skipped step and its reason.

![Skipped step with the reason "Local environment only" in the Cucumber report](../release-notes/_media/v10-step-skip-cucumber.png ':size=40%')

### Additional matching by step title
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
