# Configuration

Configuration is passed to `defineBddConfig()` inside Playwright config file.
Some options are identical to [CucumberJS options](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#options) and some are special for `playwright-bdd`.

Return value of `defineBddConfig()` is a resolved output directory where test files will be generated. It is convenient to use it as a `testDir` option for Playwright.

Example configuration in `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['feature/*.feature'],
  require: ['steps/**/*.ts'],
  importTestFrom: 'fixtures.ts',
  // ...other playwright-bdd options
});

export default defineConfig({
  testDir,
});
```

All relative paths are resolved from config file location.

> If there is `cucumber.js` config file (next to `playwright.config.ts`), it is also merged into configuration.

## Options

### paths

- Type: `string[]`
- Default: `features/**/*.{feature,feature.md}`

Paths to feature files. [More in Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features).

### require

- Type: `string[]`
- Default: `features/**/*.(js)`

Paths to step definitions in **CommonJS**. [More in Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code).

> Cucumber's option `requireModule: ['ts-node/register']` is not recommended for playwright-bdd. TypeScript compilation is performed with Playwright's built-in loader.

### import

- Type: `string[]`
- Default: `features/**/*.(js)`

Paths to step definitions in [ESM](#esm).

### importTestFrom

- Type: `string`

Path to file that exports custom `test` to be used in generated test files.

### outputDir

- Type: `string`
- Default: `.features-gen`

Directory to output generated test files.

### examplesTitleFormat

- Type: `string`
- Default: `Example #<_index_>`

Title format for `Scenario Outline` examples in generated test files.

### quotes

- Type: `'single' | 'double' | 'backtick'`
- Default: `'double'`

Quotes style in generated test files.

### tags

- Type: `string`

[Tags expression](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions) to filter scenarios for generation. Can be also defined by CLI option `--tags`.

### verbose

- Type: `boolean`
- Default: `false`

Verbose output.

## Multiple projects
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
  projects: [
    {
      name: 'chromium',
      testDir,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir,
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

If projects use **different feature files**, you should use separate `defineBddConfig()` calls inside each project. Please provide different `outputDir` for each project, otherwise generated files will overwrite each other:
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

## ESM
If your project runs in ESM:
 * has `"type": "module"` in `package.json` 
 * has `"module": "ESNext"` in `tsconfig.json`

then you should use `import` instead of `require` in `defineBddConfig()`:

```diff
const testDir = defineBddConfig({,
-  require: ['steps/*.ts'],
+  import: ['steps/*.ts'],
});
```

And use [`ts-node/esm`](https://github.com/TypeStrong/ts-node#native-ecmascript-modules) loader to run tests:
```
NODE_OPTIONS='--loader ts-node/esm --no-warnings' npx bddgen && npx playwright test
```

More details on ESM in [Cucumber docs](https://github.com/cucumber/cucumber-js/blob/main/docs/esm.md).