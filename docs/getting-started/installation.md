# Installation

Install `playwright-bdd` from npm:

```
npm i -D playwright-bdd
```

This package uses `@playwright/test` and `@cucumber/cucumber` as a peer dependencies.
For brand new projects they will be installed automatically with `playwright-bdd`.
For existing projects you may need to update them to the latest versions:

```
npm i -D @playwright/test@latest @cucumber/cucumber@latest
```

After installing/updating major Playwright version you may need to [install browsers](https://playwright.dev/docs/browsers):

```
npx playwright install
```