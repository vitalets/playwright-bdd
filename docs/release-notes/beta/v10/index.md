# Playwright-BDD v10 (beta)

The upcoming Playwright-BDD **v10** release brings several significant improvements to the development and testing experience. We're releasing this beta to help catch regressions in real-world projects before the stable release. 

You are welcome to try it with your existing test suite and report any issues you encounter. Your [feedback](https://github.com/vitalets/playwright-bdd/issues) is very appeciated!

## Installing the beta

Install from the `next` channel:

```sh
npm install --save-dev playwright-bdd@next
```

Then re-run your tests to ensure the baseline works:

```sh
npx bddgen && npx playwright test
```

Now explore the new features and try them.

## What's new

- [Source maps](#source-maps)
- [Native `--watch` mode](#native-watch-mode)
- [BDD Expressions](#bdd-expressions)
- [Playwright test locks](#playwright-test-locks)
- [Step-level attachments and skip](#step-level-attachments-and-skip)

## Source maps

Source maps connect generated Playwright tests to the original `.feature` files. They improve both VS Code integration and step display in the Playwright HTML report.

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
});
```

Run `bddgen` again after enabling this option. VS Code integration requires the Playwright extension **v1.1.20+**.

Keep `npx bddgen --watch` running while editing so scenarios run against freshly generated tests after you save your changes.

Run and debug scenarios directly from feature files in VS Code:

<video controls preload="metadata" style="width: 65%; height: auto; display: block; margin: 1em 0;" aria-label="Source maps support demo">
  <source src="release-notes/beta/v10/_media/v10-source-maps.mp4" type="video/mp4">
</video>

In the Playwright HTML report, steps now point to their Gherkin locations. Expand a step to see the scenario source with the matching line highlighted:

![Gherkin step locations and highlighted source in the Playwright HTML report](./_media/v10-source-maps-html-report.png ':size=65%')

## Native watch mode

Previously, keeping generated tests up to date required a third-party tool such as `nodemon` to rerun `bddgen` after file changes. In v10, watch mode is built into `bddgen`, so you no longer need a separate package or watcher configuration.

Start it once to regenerate tests automatically as features, steps, and their dependencies change:

```sh
npx bddgen --watch
```

![Native bddgen watch mode regenerating tests after a feature file changes](./_media/v10-watch-mode.png ':size=65%')

If generation fails, watch mode stays active and retries after your next edit.

We recommend enabling the `lockFile` option when using watch mode, especially when coding agents also run tests in the background. It coordinates generation processes and waits for active BDD workers before rewriting generated tests, preventing conflicts with ongoing test runs.

```ts
const testDir = defineBddConfig({
  sourceMaps: true,
  lockFile: true,
});
```

## BDD Expressions

[BDD Expressions](https://github.com/vitalets/bdd-expressions) is an experimental syntax that lets you write more powerful step definitions and combine multiple steps into one. It extends [Cucumber Expressions](https://github.com/cucumber/cucumber-expressions) with named parameters, inline choices, enhanced optional groups, DataTable/DocString declarations, and automatic type inference.

You can enable BDD Expressions for individual steps using the `bddExpr: true` option:

```ts
Given('bdd-expression', { bddExpr: true }, () => { ... });
```

This unlocks the new features.

### Automatic parameter types

No need to define parameter types manually, they are automatically inferred from the expression:

<img src="release-notes/beta/v10/_media/bdd-expression-positional-inference.png" alt="Editor tooltip showing the positional count parameter inferred as number." style="width: 100%; max-width: 720px; height: auto;">

### Use optional groups to combine steps

Combine similar step definitions into one:

```diff
+ I buy {int} apple(s)( for {string})
- I buy {int} apple(s)
- I buy {int} apple(s) for {string}
```

The step definition accepts required `count` and optional `recipient` parameters:

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

### Use named params

Instead of positional arguments, you can use `$step.params` that provides typed params object:

```ts
Given('I add :product to the cart( with quantity :quantity{int})', { bddExpr: true }, ({ $step }) => {
  const { product, quantity } = $step.params;
  // ...
});
```

<img src="release-notes/beta/v10/_media/bdd-expression-params.png" alt="Editor tooltip showing $step.params inferred as product: string and quantity: number | undefined" style="width: 100%; max-width: 720px; height: auto;">

### DocString and DataTable

The built-in `{DocString}` and `{DataTable}` parameters let you define a doc string or data table right in the expression.

Example of step that requires DataTable:

```ts
Given('the following users exist:{DataTable}', ({ $step }) => {
  // use `$step.dataTable` to access data
});
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

A `{DataTable}` can be optional that is very useful in some cases:

```ts
Then('the cart contains {int} products(:{DataTable})', ({ $step }) => {
  // ...
});
```

It matches both of these steps:

```gherkin
Then the cart contains 0 products
Then the cart contains 2 products:
  | pizza |
  | pepsi |
```

Check out the [Online Playground](https://vitalets.github.io/bdd-expressions/).

> **IDE support limitation:** IDE extensions do not yet support BDD Expressions syntax. Editor features such as step completion and navigation to step definitions will not work for these expressions. We plan to address this limitation in a future update.

## Playwright test locks

Use [Playwright test locks](https://playwright.dev/docs/test-parallel#test-locks) by declaring a `lock` on steps that use a shared resource:

```ts
Given('the user settings are reset', { lock: 'user-settings' }, async ({ request }) => {
  await request.post('/reset');
});
```

Scenarios using these steps inherit their locks. Tests sharing a lock cannot run at the same time within the same Playwright run.

Locks apply to whole tests and require **Playwright 1.63 or later**.

## Step-level attachments and skip

Use `$step.attach()` to attach a file or value to the current BDD step:

```ts
Then('the response is valid', async ({ $step }) => {
  await $step.attach('response', {
    body: 'response details',
    contentType: 'text/plain',
  });
});
```

![Step-level attachment in the Playwright HTML report](./_media/v10-step-attachments.png ':size=65%')

Use `$step.skip()` to stop the current step and continue with the next one:

```ts
Given('the local payment mock is ready', async ({ $step }) => {
  $step.skip(process.env.TARGET !== 'local', 'Local environment only');
  // Set up the mock...
});
```

Call it from the step body or a `BeforeStep` hook. Calling it from `AfterStep` is not supported.

The skip reason appears in Cucumber reports. A scenario with a skipped step may appear as passed in Playwright and skipped in Cucumber.

![Skipped step with the reason "Local environment only" in the Cucumber report](./_media/v10-step-skip-cucumber.png ':size=40%')

Use `$step.info` to access Playwright’s step information.

## Upgrading

### Upgrade Playwright to 1.53+

The minimum supported Playwright version is now **1.53**. Playwright-BDD supports the latest stable minor and the 10 previous minor releases.

### Replace `junit-modern` with `junit`

The deprecated reporter alias has been removed. Rename it in your configuration:

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
