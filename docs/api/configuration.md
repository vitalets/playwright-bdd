# Configuration

## `defineBddConfig`

Defines BDD config inside the Playwright config file.

**Usage:** `defineBddConfig(config)`

**Params:**

- `config` _object_ - BDD [configuration](configuration/index.md)

**Returns:** _string_ - Directory where test files will be generated.

## `defineBddProject`

<div style="color: gray; font-size: 0.8em">Since <b>v7.0.0</b></div>

A thin wrapper around `defineBddConfig()` that simplifies BDD configuration for Playwright projects. It accepts a project name and automatically sets the [`outputDir`](configuration/options.md#outputdir) based on that name. The function returns an object `{ name, testDir }`, which can be merged into the project config using the spread operator.

**Usage:** `defineBddProject(config)`

**Params:**

- `config` _object_ - BDD [configuration](configuration/index.md) + project name `{ name: string }`

**Returns:** _{ name, testDir }_ - Object containing the project name and the generated tests directory.

Example:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      ...defineBddProject({
        name: 'foo',
        features: 'features/**/*.feature',
        steps: 'steps/**/*.ts',
      }), // -> { name: 'foo', testDir: '.features-gen/foo' }
    },
  ],
});
```

## `cucumberReporter`

Helper function to output test results in various [Cucumber reporters](reporters/cucumber.md).

**Usage:** `cucumberReporter(reporter[, options])`

**Params:**

- `reporter` _string_ - Cucumber reporter name (`html|json|junit|message`) or path to a custom reporter file.
- `options` _object_ - Cucumber reporter options.

**Returns:** _array_ - Playwright reporter tuple configuration.

Example usage in `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';
import { cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [cucumberReporter('html', { outputFile: 'reports/report.html' })],
  // ...other options
});
```
