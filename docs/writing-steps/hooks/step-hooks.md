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

> Consider using [fixtures](writing-steps/hooks/fixtures.md) instead of hooks.

Playwright-BDD supports the step-level hook `AfterStep`. It runs **after each successful step**.

> `AfterStep` currently does **not** run when the step itself fails.
> This differs from Cucumber semantics and is documented intentionally.
> The obvious `try/finally` implementation is not enough here because it would need to preserve
> the original step error, keep Playwright `skip` semantics intact, and avoid interfering with
> timeout / interruption behavior.
> See the discussion in [issue #383](https://github.com/vitalets/playwright-bdd/issues/383#issuecomment-4273815382).

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { AfterStep } = createBdd(test);

AfterStep(async () => {
  // runs after each successful step
});
```

All options and behavior are similar to [BeforeStep](#beforestep).

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
