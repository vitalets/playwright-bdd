# auth-in-steps playwright-bdd example

Example of dynamic authentication in BDD steps. It allows you to dynamically authenticate with needed account via steps, e.g.:
```
Given I am logged in as "xxx@example.com"
```

The main challenge with dynamic authentication - steps run *after* all fixtures setup, so you can't switch `storageState` fixture to a particular account.

## Solution

Since Playwright 1.59, [`context.setStorageState()`](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-storage-state) allows loading auth state into the **existing** browser context at any point during a test — including inside a BDD step. This makes the implementation straightforward:

1. Save auth state files per user in a setup project (see `features/auth/setup.ts`).
2. In the `Given I am logged in as` step, call `context.setStorageState(file)` with the matching state file.
3. Continue using the standard `page` fixture in subsequent steps — it belongs to the same context and is now authenticated.

> **Note:** This approach requires Playwright ≥ 1.59.  
> For an example compatible with older Playwright versions, see the [8.5.0 version of this example](https://github.com/vitalets/playwright-bdd/tree/8.5.0/examples/auth-in-steps).