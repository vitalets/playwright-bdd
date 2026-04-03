# Authentication

Playwright-BDD supports two approaches to authentication that match the two main patterns in [Playwright's auth documentation](https://playwright.dev/docs/auth):

1. **Static** — one shared account, authenticated once before the test run via a setup project
2. **Dynamic** — authentication happens inside BDD steps, e.g. `Given I am logged in as "user1"`

## Static authentication

Use this approach when all (or most) tests share the same user account.

### Setup

Create a separate non-BDD **setup project** that runs authentication once and saves the storage state to a file. The BDD project depends on it and loads the saved state via the `storageState` option.

It is important to set an explicit `testDir` for the setup project so Playwright knows where to look for its test files (see [Projects](configuration/multiple-projects.md)):

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export const AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
  projects: [
    {
      name: 'auth',
      testDir: 'features/auth',   // <-- explicit testDir for setup project
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      testDir: defineBddConfig({
        features: 'features/*.feature',
        steps: 'features/steps/*.ts',
      }),
      use: {
        storageState: AUTH_FILE,  // <-- use saved auth state
      },
      dependencies: ['auth'],
    },
  ],
});
```

The setup file saves the authenticated storage state:

```ts
// features/auth/setup.ts
import { test as setup, expect } from '@playwright/test';
import { AUTH_FILE } from '../../playwright.config';

setup('authenticate', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByRole('link', { name: 'Sign Out' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
```

### Handling unauthenticated scenarios

To skip authentication for specific scenarios, add a `@noauth` tag and override the `storageState` fixture to clear it when that tag is present:

```gherkin
@noauth
Scenario: Login page is accessible to guests
  Given I am on the login page
  Then I see the "Log In" button
```

```ts
// features/steps/fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  storageState: async ({ $tags, storageState }, use) => {
    if ($tags.includes('@noauth')) {
      storageState = { cookies: [], origins: [] };
    }
    await use(storageState);
  },
});

export const { Given, When, Then } = createBdd(test);
```

> See the full working example: [examples/auth](https://github.com/vitalets/playwright-bdd/tree/main/examples/auth)

---

## Dynamic authentication in steps

Use this approach when different scenarios authenticate as different users, specified dynamically via BDD steps:

```gherkin
Scenario: Admin sees the dashboard
  Given I am logged in as "admin"
  When I navigate to the dashboard
  Then I see the admin panel

Scenario: Regular user sees limited menu
  Given I am logged in as "user1"
  When I navigate to the dashboard
  Then I do not see the admin panel
```

### The challenge

BDD steps run *after* all Playwright fixtures are already set up, so you cannot change the `storageState` fixture from within a step using the standard approach.

### Solution (Playwright ≥ 1.59)

Since Playwright 1.59, [`context.setStorageState()`](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-storage-state) allows loading auth state into the **existing** browser context at any point — including inside a BDD step. This makes implementation straightforward:

**1. Save auth state per user in a setup project:**

```ts
// features/auth/setup.ts
import { test as setup, expect } from '@playwright/test';
import { AUTH_FILE } from '../../playwright.config';

// run setups in parallel
setup.describe.configure({ mode: 'parallel' });

setup('authenticate user1', async ({ page }) => {
  await authenticate(page, 'user1');
});

setup('authenticate user2', async ({ page }) => {
  await authenticate(page, 'user2');
});

async function authenticate(page, userName) {
  // ...perform login for userName...
  await page.context().storageState({ path: AUTH_FILE.replace('{user}', userName) });
}
```

**2. Load the matching state in the login step:**

```ts
// features/steps/index.ts
import { createBdd } from 'playwright-bdd';
import { test } from '@playwright/test';
import { AUTH_FILE } from '../../playwright.config';

const { Given } = createBdd(test);

Given('I am logged in as {string}', async ({ context }, userName: string) => {
  const storageState = AUTH_FILE.replace('{user}', userName);
  // @ts-ignore - setStorageState is available since Playwright 1.59
  await context.setStorageState(storageState);
});
```

After this step, the `page` fixture (and any pages opened from it) will be authenticated as the specified user. No custom fixtures or manual context management are needed.

> See the full working example: [examples/auth-in-steps](https://github.com/vitalets/playwright-bdd/tree/main/examples/auth-in-steps)

### Playwright < 1.59

For older Playwright versions, you can manually create a new browser context with the desired storage state and pass the resulting page through a custom fixture. See the [pre-1.59 version of the auth-in-steps example](https://github.com/vitalets/playwright-bdd/tree/8.5.0/examples/auth-in-steps) for a full working implementation.
