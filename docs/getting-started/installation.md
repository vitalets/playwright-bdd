# Installation

### Step 1: install playwright-bdd

Install `playwright-bdd` from npm:

```
npm i -D playwright-bdd
```

### Step 2: install Playwright browsers

This package uses `@playwright/test` as a peer dependency. If you update the Playwright version, you may need to [install browsers](https://playwright.dev/docs/browsers):

```
npx playwright install
```

To install only `chromium`:
```
npx playwright install chromium
```