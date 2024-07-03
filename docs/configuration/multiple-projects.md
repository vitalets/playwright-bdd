# Multiple projects
You can use `playwright-bdd` with multiple [Playwright projects](https://playwright.dev/docs/test-projects). 

If all projects use **the same feature files**, you can re-use `testDir` from single `defineBddConfig()`:
```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['feature/*.feature'],
  require: ['steps/**/*.ts'],
  importTestFrom: 'fixtures.ts',
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

If projects use **different feature files**, you should use separate `defineBddConfig()` calls inside each project.

> Please provide different `outputDir` for each project, otherwise generated files will overwrite each other

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project-one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'project-one/steps/fixtures.ts',
        paths: ['project-one/*.feature'],
        require: ['project-one/steps/*.ts'],
      }),
    },
    {
      name: 'project-two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'project-two/steps/fixtures.ts',
        paths: ['project-two/*.feature'],
        require: ['project-two/steps/*.ts'],
      }),
    },
  ],
});
```

Since **playwright-bdd v7** there is new helper function [`defineBddProject()`](api.md#definebddprojectconfig) that automatically sets `outputDir` from project name:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      ...defineBddProject({
        name: 'project-one',
        importTestFrom: 'project-one/steps/fixtures.ts',
        paths: ['project-one/*.feature'],
        require: ['project-one/steps/*.ts'],
      }),
    },
    {
      ...defineBddProject({
        name: 'project-two',
        importTestFrom: 'project-two/steps/fixtures.ts',
        paths: ['project-two/*.feature'],
        require: ['project-two/steps/*.ts'],
      }),
    },
  ],
});
```

#### Authentication project

When using [separate project for authentication](https://playwright.dev/docs/auth#basic-shared-account-in-all-tests), it is important to explicitly set `testDir` for it:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['steps/*.ts'],
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