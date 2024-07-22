# Multiple projects
You can use `playwright-bdd` with multiple [Playwright projects](https://playwright.dev/docs/test-projects). 

## Same features
If all projects use **the same feature files**, you can re-use `testDir` from single `defineBddConfig()`:
```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'feature/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  testDir,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

## Different features
If projects use **different feature files**, you can use a special helper [`defineBddProject()`](api.md#definebddprojectconfig) (since v7). In addition to the standard BDD config, it accepts a project name and automatically sets `outputDir` based on that name. The function returns an object `{ name, testDir }`, which can be merged into project config with spread operator.

```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      ...defineBddProject({
        name: 'project-one',
        features: 'project-one/*.feature',
        steps: 'project-one/steps/*.ts',
      }),
    },
    {
      ...defineBddProject({
        name: 'project-two',
        features: 'project-two/*.feature',
        steps: 'project-two/steps/*.ts',
      }),
    },
  ],
});
```

If you use plain `defineBddConfig()` for different projects, you should manually provide different `outputDir` for each project, otherwise generated files will overwrite each .

The same configuration with `defineBddConfig()`:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project-one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        features: 'project-one/*.feature',
        steps: 'project-one/steps/*.ts',
      }),
    },
    {
      name: 'project-two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        features: 'project-two/*.feature',
        steps: 'project-two/steps/*.ts',
      }),
    },
  ],
});
```

## Authentication

When using separate non-bdd project [for authentication](https://playwright.dev/docs/auth#basic-shared-account-in-all-tests), it is important to explicitly set `testDir` for it:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
  projects: [
    {
      name: 'setup',
      testDir: './setup-steps', // <-- set testDir for setup project
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },      
    },
  ],
});
```