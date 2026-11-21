# Playwright-BDD v10 (beta)

The upcoming Playwright-BDD **v10** release brings several significant improvements. We're releasing this beta to help catch regressions in real-world projects before the stable release. 

You are welcome to try it and report any issues. Your [feedback](https://github.com/vitalets/playwright-bdd/issues) is very appeciated!

## Installing the beta

Install `playwright-bdd@next`:

```sh
npm install --save-dev playwright-bdd@next
```

Then re-run your tests to ensure the baseline works:

```sh
npx bddgen && npx playwright test
```

Now explore the new features.

## What's new

- [Native `--watch` mode](#native-watch-mode)
- [Source maps](#source-maps)
- [BDD Expressions](#bdd-expressions)
- [Playwright test locks](#playwright-test-locks)
- [Step-level attachments and skip](#step-level-attachments-and-skip)

## Native watch mode

Previously, keeping generated tests up to date required a third-party tool such as `nodemon` to rerun `bddgen` after file changes. In v10, watch mode is built into `bddgen`, so you no longer need a separate package or watcher configuration.

Start it once to regenerate tests automatically as features, steps, and their dependencies change:

```sh
npx bddgen --watch
```

![Native bddgen watch mode regenerating tests after a feature file changes](./_media/v10-watch-mode.png ':size=65%')

Try to change source files, feature files, or step definition - the test generation should re-run automatically.

By default, watch mode watches the directory containing the nearest `package.json`, starting from your Playwright config directory, and respects its `.gitignore`. If no `package.json` is found, it watches the config directory. You can customize the watched paths with the `watch` option:

```ts
const testDir = defineBddConfig({
  watch: {
    packageRoot: false, // Disable watching the entire package directory.
    include: ['./src', '../shared'], // Watch additional files or directories.
    exclude: ['./src/generated'], // Ignore specific files or directories.
  },
});
```

Paths are relative to your Playwright config file and do not support globs. Feature and step definition directories, and the config file are always watched.

We recommend enabling the `lockFile` option when using watch mode, especially when coding agents also run tests in the background. It coordinates generation processes and waits for active BDD workers before rewriting generated tests, preventing conflicts with ongoing test runs.

```ts
const testDir = defineBddConfig({
  lockFile: true,
});
```

## Source maps

Source maps connect generated Playwright tests to the original `.feature` files. They improve both VS Code integration and step display in the Playwright HTML report.

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

Run `npx bddgen` again after enabling this option. 

Now you can run and debug scenarios directly from feature files in Playwright VS Code Extension (**v1.1.20+**). 

Check the video:

<video controls preload="metadata" style="width: 65%; height: auto; display: block; margin: 1em 0;" aria-label="Source maps support demo">
  <source src="release-notes/beta/v10/_media/v10-source-maps.mp4" type="video/mp4">
</video>

You might need to reload the extension to get these green arrows:

<img src="release-notes/beta/v10/_media/v10-reload-extension.png" alt="Reload button in the VS Code Testing panel" style="width: 354px; max-width: 100%; height: auto;">

Keep `npx bddgen --watch` running while editing, so scenarios run against freshly generated tests after you save your changes. Don't forget to enable autosave in your IDE.

In the Playwright HTML report, steps now point to their Gherkin locations. Expand a step to see the scenario source with the matching line highlighted:

![Gherkin step locations and highlighted source in the Playwright HTML report](./_media/v10-source-maps-html-report.png ':size=65%')

## BDD Expressions

[BDD Expressions](https://github.com/vitalets/bdd-expressions) is an alternative syntax for step definitions. It extends [Cucumber Expressions](https://github.com/cucumber/cucumber-expressions) and lets you combine more steps with one powerfull expression. It offers named parameters, inline choices, enhanced optional groups, DataTable/DocString declarations, and automatic type inference.

You can enable BDD Expressions for individual steps using the `bddExpr: true` option:

```ts
Given('bdd-expression', { bddExpr: true }, () => { ... });
```

This unlocks the new features.

### Automatic parameter types

No need to define parameter types manually, they are automatically inferred from the expression:

<img src="release-notes/beta/v10/_media/bdd-expression-positional-inference.png" alt="Editor tooltip showing the positional count parameter inferred as number." style="width: 100%; max-width: 720px; height: auto;">

### Optional groups to combine steps

Combine similar step definitions into one, using optional text with params:

```
I buy {int} apple(s)( for {string})
```

It replaces these two step definitions:
```
I buy {int} apple(s)
I buy {int} apple(s) for {string}
```

In the step function you'll get required `count` and optional `recipient`:

```ts
Given('I buy {int} apple(s)( for {string})', { bddExpr: true }, async ({}, count, recipient) => {
  // ...general action
  if (recipient) {
    // ...additional action if recipient provided
  }
});
```

This expression matches all the steps below:

```gherkin
Given I buy 0 apples
Given I buy 1 apple
Given I buy 2 apples for "Alice"
```

### Named params

You can define named params as `:name` and access them via `$step.params`:

```
I add :product to the cart
```

Here `:product` is named param, with the default type `{string}`. The step funciton can access product as `$step.params.product`:

```ts
Given('I add :product to the cart', { bddExpr: true }, ({ $step }) => {
  const { product } = $step.params;
  // ...
});
```

Named params are also automatically typed:

<img src="release-notes/beta/v10/_media/bdd-expression-params.png" alt="Editor tooltip showing $step.params inferred as product: string and quantity: number | undefined" style="width: 100%; max-width: 720px; height: auto;">

### DocString and DataTable

BDD-expressions provide built-in `{DocString}` and `{DataTable}` parameters, that let you require DocString or DataTable right from the expression.

Example of step that requires DataTable:

```
the following users exist:{DataTable}
```

✅ Matches:

```gherkin
Given the following users exist:
  | name  |
  | Alice |
  | Bob   |
```

❌ Does not match (the required data table is missing):

```gherkin
Given the following users exist:
```

Step function can use `$step.dataTable` to access data:

```ts
Given('the following users exist:{DataTable}', ({ $step }) => {
  console.log($step.dataTable.hashes());
});
```

A `{DataTable}` can be optional that is very useful in some cases:

```
the cart contains {int} product(s)(:{DataTable})
```

It matches all these steps:

```gherkin
Then the cart contains 0 products
Then the cart contains 1 products:
  | pizza |
Then the cart contains 2 products:
  | pizza |
  | pepsi |
```

Check out the [Online Playground](https://vitalets.github.io/bdd-expressions/).

> ⚠️ **IDE support limitation:** IDE extensions do not yet support BDD Expressions syntax. Editor features such as step completion and navigation to step definitions will not work for these expressions. We plan to address this limitation in a future update.

## Playwright test locks

Use [Playwright test locks](https://playwright.dev/docs/test-parallel#test-locks) to restrict parallel run of particular tests. You can set the `lock` option on a step, and then all scenarios using this step will have that lock.

For example:

```ts
Given('the user settings are reset', { lock: 'user-settings' }, async ({ request }) => {
  await request.post('/reset');
});
```

These scenarios will not run in parallel:

```gherkin
Feature: User settings

  Scenario: Change the display name
    Given the user settings are reset
    When the user changes their display name to "Alice"
    Then the display name should be "Alice"

  Scenario: Change the language
    Given the user settings are reset
    When the user changes their language to "Spanish"
    Then the language should be "Spanish"
```

Locks require **Playwright 1.63+**.

## Step-level attachments and skip

You can attach a file or value to the specific BDD step instead of entire test. Use `$step.attach()` for that:

```ts
Then('the response is valid', async ({ $step }) => {
  await $step.attach('response', {
    body: 'response details',
    contentType: 'text/plain',
  });
});
```

![Step-level attachment in the Playwright HTML report](./_media/v10-step-attachments.png ':size=65%')

Use `$step.skip()` to conditionally skip the current step and continue with the next one:

```ts
Given('the local payment mock is ready', async ({ $step }) => {
  $step.skip(process.env.TARGET !== 'local', 'Local environment only');
  // Set up the mock...
});
```

Call it from the step body or a `BeforeStep` hook. Calling it from `AfterStep` is not supported.

The skip reason appears in Cucumber reports:

![Skipped step with the reason "Local environment only" in the Cucumber report](./_media/v10-step-skip-cucumber.png ':size=40%')

Use `$step.info` to access Playwright’s step information.

## Upgrading

### Upgrade Playwright to 1.53+

The minimum supported Playwright version is now **1.53**. Playwright-BDD supports the latest stable minor and the **10** previous releases.

### Replace `junit-modern` with `junit`

The deprecated `junit-modern` reporter alias has been removed. Rename it to `junit` in your configuration:

```js
// Before
cucumberReporter('junit-modern', { outputFile: 'report.xml' })

// After
cucumberReporter('junit', { outputFile: 'report.xml' })
```

## Full changelog

See the [Changelog](https://github.com/vitalets/playwright-bdd/blob/main/CHANGELOG.md) for the full release history.

---

Thank you to everyone who reported issues, contributed code, and shared feedback.

If you have trouble upgrading, please [open an issue](https://github.com/vitalets/playwright-bdd/issues).
