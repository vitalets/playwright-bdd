# Usage with TestDino

You can integrate Playwright-BDD tests with [TestDino](https://testdino.com/) for test reporting and analytics.

#### 1. [Sign up](https://app.testdino.com/auth/signup) to TestDino and create a project

Create an organization and project from your dashboard, then generate an API key in project settings.

> Treat the API key as a secret. Never commit it to source control. Store it in your CI secret store when running in CI.

#### 2. Install dependencies

Install the TestDino reporter:

```sh
npm i -D @testdino/playwright
```

Install [dotenv](https://www.npmjs.com/package/dotenv) to load the API key from a local `.env` file:

```sh
npm i -D dotenv
```

#### 3. Setup credentials

Create a `.env` file in the project root:

```bash
TESTDINO_TOKEN=your_api_key_here
```

> Add `.env` to `.gitignore` to avoid leaking credentials.

#### 4. Adjust Playwright configuration

Configure the reporter in `playwright.config.ts`:

```ts
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    ['@testdino/playwright', { token: process.env.TESTDINO_TOKEN }],
    ['html', { open: 'never' }],
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### 5. Run tests

With `.env` configured:

```sh
npx bddgen && npx playwright test
```

To provide the token directly in the shell instead of `.env`:

Linux / Mac:

```sh
export TESTDINO_TOKEN=your_api_key_here
npx bddgen && npx playwright test
```

Windows CMD:

```cmd
set TESTDINO_TOKEN=your_api_key_here && npx bddgen && npx playwright test
```

Windows PowerShell:

```powershell
$env:TESTDINO_TOKEN="your_api_key_here"
npx bddgen && npx playwright test
```

#### 6. View results

Open [TestDino](https://app.testdino.com) and check **Test Runs** for pass/fail counts, duration, commit metadata, screenshots, traces, and failure analysis.

You can also explore the [TestDino Sandbox](https://sandbox.testdino.com/) before your first run.

### Running in CI

Add `TESTDINO_TOKEN` to your CI secret store and expose it as an environment variable. Example for GitHub Actions:

```yaml
name: Playwright BDD Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Generate BDD specs and run tests
        run: npx bddgen && npx playwright test
        env:
          TESTDINO_TOKEN: ${{ secrets.TESTDINO_TOKEN }}
```

### Troubleshooting

**Results do not appear in the dashboard**

* Ensure `TESTDINO_TOKEN` is valid and belongs to the correct project.
* If you use `.env`, make sure `import 'dotenv/config';` is loaded before config reads `process.env.TESTDINO_TOKEN`.
* On Windows CMD, use `set TESTDINO_TOKEN=...` when not using `.env`.

**`@testdino/playwright` cannot be resolved**

* Reinstall the reporter: `npm i -D @testdino/playwright`

**Feature files do not execute**

* Run `npx bddgen` before `npx playwright test` so Playwright-BDD generates spec files from `.feature` files.

**WebSocket shows offline or disconnected**

* The reporter keeps buffering and uploads when the connection is restored.
* Toggle streaming off and on again from the Test Runs page if you need to reconnect manually.
