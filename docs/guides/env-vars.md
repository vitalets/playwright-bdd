# Environment variables

You can use environment varibales inside step definitions:
```js
When('I log in', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
});
```

Actual values can be provided via `.env` file, imported in `playwright.config.ts` with the help of [dotenv](https://github.com/motdotla/dotenv) package:

```
# .env
USERNAME=foo
PASSWORD=bar
```

```ts
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

import 'dotenv/config'; // <-- populate env variables from .env

const testDir = defineBddConfig({
  // ...
});

export default defineConfig({
  // ...
});
```

Alternatively, you can pass environment variables directly to the CLI command.
An important aspect is how to properly do it. 

The following **will not work**:
```sh
USERNAME=foo npx bddgen && npx playwright test
```

The problem is that `USERNAME` is passed to `npx bddgen`, but not to the `npx playwright test`.

The easiest way to fix it is to put the whole command into the npm script in the `package.json`:
```diff
"scripts": {
+   "test": "npx bddgen && npx playwright test",
},
```
And then run as:
```sh
USERNAME=foo npm test
```

Or, you can provide env variables to the whole command with the [cross-env](https://github.com/kentcdodds/cross-env) package:

```sh
npx cross-env-shell USERNAME=foo "npx bddgen && npx playwright test"
```