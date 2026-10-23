# Writing steps

**Step definitions** are registered with `Given()`, `When()`, `Then()` functions and contain actual implementation of steps.

There are **3 styles** of writing steps in Playwright-BDD:

1. [Playwright-style](writing-steps/playwright-style.md) - write steps like you write Playwright tests, recommended for new BDD projects or existing Playwright projects.
2. [Cucumber-style](writing-steps/cucumber-style.md) - write steps in a CucumberJS compatible way, use `this` to access the world and Playwright fixtures. Recommended for migrating CucumberJS projects to the Playwright runner.
3. [Decorators](writing-steps/decorators.md) - mark POM class methods as steps, recommended for all projects.

#### Examples

Playwright-style step definition:
```ts
Given('I open page {string}', async ({ page }, url: string) => {
  await page.goto(url);
});
```

Cucumber-style step definition:
```ts
Given('I open page {string}', async function (url: string) {
  await this.page.goto(url);
});
```

Decorator step definition:
```ts
class TodoPage {
  @Given('I open page {string}')
  async open(url: string) {
    await this.page.goto(url);
  }
}
```

Check out the corresponding sections to learn more about each style.

?> Note that there are no `And()` / `But()` functions, as these keywords are used only for better semantics in `.feature` files.

## Step timeout

<div style="color: gray; font-size: 0.9em">Since <b>v10.0.0</b></div>

Set `timeout` in the step definition options to limit its duration in milliseconds:

```ts
Given('I open the dashboard', { timeout: 10_000 }, async ({ page }) => {
  await page.goto('/dashboard');
});
```

This option is supported in Playwright-style, Cucumber-style, and decorator step definitions. For decorators, pass it as the second argument: `@Given('I open the dashboard', { timeout: 10_000 })`.

The timeout covers the step body and its `BeforeStep` / `AfterStep` hooks. Hook-specific timeouts still apply independently. If the limit is exceeded, Playwright throws a `TimeoutError`; `AfterStep` hooks are not guaranteed to finish or run after a timeout.

Omitting `timeout` or setting it to `0` disables the separate step timeout. The overall test timeout and action/assertion timeouts still apply. Fixture setup and parameter transformation happen outside the step timeout.

The timeout applies when a definition is invoked by a Gherkin step. Calling a reusable step function or decorated method directly does not apply its own step timeout.
