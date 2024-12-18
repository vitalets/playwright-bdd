# Multiple projects
You can use Playwright-BDD with multiple [Playwright projects](https://playwright.dev/docs/test-projects). 

## Same feature files

If all projects use **the same set of feature files**, you can define a single `testDir` option at the root level of the config:
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

## Different feature files

If projects use **different feature files**, you should define a separate `testDir` for each project:
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

?> Please note that you should also set a unique `outputDir` for each project to avoid conflicts.

For convenience, there is a helper function [`defineBddProject()`](api.md#definebddproject). In addition to the standard BDD config, it accepts a project name and automatically sets `outputDir` based on that name. The function returns an object `{ name, testDir }`, which can be merged into the project config with the spread operator.

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

## Non-BDD projects

You can have non-BDD projects in the same Playwright config. Just ensure that non-BDD projects have their own `testDir`. See the example in **Authentication** below. 

## Authentication

When using a separate non-BDD project [for authentication](https://playwright.dev/docs/auth#basic-shared-account-in-all-tests), it is important to explicitly set `testDir` for it:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
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