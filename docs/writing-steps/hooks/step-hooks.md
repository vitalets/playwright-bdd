# Step Hooks

## BeforeStep

Playwright-BDD supports the step-level hook `BeforeStep`. It runs **before each step**.

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { BeforeStep } = createBdd(test);

BeforeStep(async () => {
  // runs before each step
});
```

You can target step hook to the steps of the specific feature/scenario by `tags`:

```ts
BeforeStep({ tags: '@mobile and not @slow' }, async function () {
  // runs for scenarios with @mobile and not @slow
});
```

If you want to pass only tags, you can use a shortcut:
```ts
BeforeStep('@mobile and not @slow', async function () {
  // runs for scenarios with @mobile and not @slow
});
```

You can also provide default tags via `createBdd()`:
```ts
const { BeforeStep } = createBdd(test, { tags: '@mobile' });

BeforeStep(async () => {
  // runs only for scenarios with @mobile
});
```

If the hook has both default and own tags, they are combined using `AND` logic:
```ts
const { BeforeStep } = createBdd(test, { tags: '@mobile' });

BeforeStep({ tags: '@slow' }, async function () {
  // runs for scenarios with @mobile and @slow
});
```

Additionally, you can set `name` and `timeout` for the hook:
```ts
BeforeStep({ name: 'my hook', timeout: 5000 }, async function () {
  // ...
});
```

The hook function accepts **1 argument** - [test-scoped fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures). You can access [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/bdd-fixtures.md#tags) and any built-in or custom fixtures. See more details in [BeforeStep API](api.md#beforestep).

## AfterStep

Playwright-BDD supports the step-level hook `AfterStep`. It runs **after each invoked step**.

If the step body throws, the thrown value is available as `$step.error` inside `AfterStep`.
If a `BeforeStep` hook fails, the step body is not invoked and `AfterStep` does not run for that step.
Playwright hard timeouts and interruptions can still abort execution before `AfterStep` runs.

> Do not rely on `$testInfo.status` inside `AfterStep` to detect whether the current step failed.
> Playwright may still expose `status: "passed"` while the step error is being handled.
> Use `$step.error` instead, and handle skipped or other control-flow errors according to your
> project needs.

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { AfterStep } = createBdd(test);

AfterStep(async () => {
  // runs after each invoked step when Playwright allows execution to continue
});
```

All options are similar to [BeforeStep](#beforestep).

#### Example of using `AfterStep` to capture screenshot after each step

Create `fixtures.ts`:
```ts
export const { AfterStep } = createBdd(test);
```

Import `fixtures.ts` in step definition:
```ts
import { AfterStep } from './fixtures';

AfterStep(async ({ page, $testInfo, $step }) => {
  await $testInfo.attach(`screenshot after ${$step.title}`, {
    contentType: 'image/png',
    body: await page.screenshot(),
  });
});

// ...rest of the step definitions
```

#### Example of using `AfterStep` only for failed steps

Create `fixtures.ts`:
```ts
export const { AfterStep } = createBdd(test);
```

Import `fixtures.ts` in step definition:
```ts
import { AfterStep } from './fixtures';

AfterStep(async ({ $testInfo, $step }) => {
  if (!$step.error) return;

  if (isSkippedStepError($step.error)) {
    // A skipped step is exposed as an error by Playwright.
    // Decide whether to attach diagnostics for skipped steps in your project.
    return;
  }

  await $testInfo.attach(`logs for ${$step.title}`, {
    contentType: 'text/plain',
    body: getLogsForCurrentStep(),
  });
});

function isSkippedStepError(error: unknown) {
  return error instanceof Error && error.message.includes('Test is skipped');
}
```
