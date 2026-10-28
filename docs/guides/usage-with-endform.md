# Usage with Endform

You can run Playwright-BDD tests remotely with [Endform](https://endform.dev/).

#### 1. Install Endform and log in

```sh
npm i -D endform
npx endform login
```

See the [Endform getting started guide](https://endform.dev/docs/guides/getting-started) for account setup.

#### 2. Add Endform configuration

Create `endform.config.ts` in your project root:

```ts
import { defineEndformConfig } from 'endform';

export default defineEndformConfig({
  // Resolve BDD configuration paths on each remote machine.
  environmentVariables: ['!^PLAYWRIGHT_BDD_CONFIGS$'],
  // BDD loads step definitions by glob rather than static imports.
  additionalFiles: ['features/steps/*.ts'],
});
```

Playwright-BDD stores configuration containing local absolute paths in `PLAYWRIGHT_BDD_CONFIGS`. Exclude it from [Endform's environment transfer](https://endform.dev/docs/reference/environment-variables) so remote workers can initialize configuration using their own paths.

Adjust `additionalFiles` to match your step definition files and any other files loaded dynamically by your tests.

#### 3. Adjust Playwright configuration

Use `defineBddConfigWrapper()` for your BDD configuration in `playwright.config.ts`, and add the `build.external` setting to your existing Playwright configuration:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfigWrapper({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
  sourceMaps: false,
});

export default defineConfig({
  testDir,
  // Preserve generated BDD metadata line numbers on remote workers.
  build:
    process.env.ENDFORM === 'true' ? { external: ['**/.features-gen/**/*.spec.js'] } : undefined,
  // ...
});

// A helper to initialize BDD configuration in Endform
function defineBddConfigWrapper(options: Parameters<typeof defineBddConfig>[0]) {
  const initializeBdd = process.env.ENDFORM === 'true' && !process.env.PLAYWRIGHT_BDD_CONFIGS;
  if (!initializeBdd) return defineBddConfig(options);

  // Endform starts workers directly, so initialize BDD state on the remote machine.
  const workerIndex = process.env.TEST_WORKER_INDEX;
  delete process.env.TEST_WORKER_INDEX;

  try {
    return defineBddConfig(options);
  } finally {
    // Restore the worker identity after BDD initialization, even if it throws.
    if (workerIndex !== undefined) process.env.TEST_WORKER_INDEX = workerIndex;
  }
}
```

The wrapper temporarily clears `TEST_WORKER_INDEX` so Playwright-BDD can initialize its configuration, then restores the worker identity before returning. This example covers a single BDD configuration. The `build.external` setting prevents transformation of the generated tests, preserving the line numbers used by BDD metadata. If you use a custom `outputDir`, adjust the pattern accordingly.

#### 4. Run tests

Generate the Playwright tests before starting Endform:

```sh
npx bddgen && npx endform test
```

You can also add a script to `package.json`:

```json
{
  "scripts": {
    "test:endform": "bddgen && endform test"
  }
}
```

Run `npm run test:endform` and follow the run link printed by Endform to view the results.
