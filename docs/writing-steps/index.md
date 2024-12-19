# Writing steps

There are 3 ways of writing steps in Playwright-BDD:

1. [Playwright-style](writing-steps/playwright-style.md) - write steps like you write Playwright tests, recommended for new BDD projects or existing Playwright projects.
2. [Cucumber-style](writing-steps/cucumber-style.md) - write steps in a [CucumberJS](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/step_definitions.md) compatible way, use `this` to access the world and Playwright fixtures. Recommended for migrating CucumberJS projects to the Playwright runner.
3. [Decorators](writing-steps/decorators.md) - mark class methods as steps, recommended for all projects.

#### Examples

Playwright-style step:
```ts
Given('I open page {string}', async ({ page }, url: string) => {
  await page.goto(url);
});
```

Cucumber-style step:
```ts
Given('I open page {string}', async function (url: string) {
  await this.page.goto(url);
});
```

Decorators:
```ts
class TodoPage {
  @Given('I open page {string}')
  async open(url: string) {
    await this.page.goto(url);
  }
}
```