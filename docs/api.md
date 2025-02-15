# API

### defineBddConfig

Defines BDD config inside the Playwright config file.

**Usage:** `defineBddConfig(config)`

**Params:**
  * `config` *object* - BDD [configuration](configuration/index.md)

**Returns:** *string* - Directory where test files will be generated.

### defineBddProject
<div style="color: gray; font-size: 0.8em">Since <b>v7.0.0</b></div>

A thin wrapper around `defineBddConfig()` that simplifies BDD configuration for Playwright projects. It accepts a project name and automatically sets the [`outputDir`](configuration/options.md#outputdir) based on that name. The function returns an object `{ name, testDir }`, which can be merged into the project config using the spread operator.

**Usage:** `defineBddProject(config)`

**Params:**
  * `config` *object* - BDD [configuration](configuration/index.md) + project name `{ name: string }`

**Returns:** *{ name, testDir }* - Object containing the project name and the generated tests directory.

Example:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      ...defineBddProject({
        name: 'foo',
        features: '*.feature',
        steps: 'steps/*.ts',
      }), // -> { name: 'foo', testDir: '.features-gen/foo' }
    },
  ]
});  
```   

### cucumberReporter

Helper function to output test results in various [Cucumber reporters](reporters/cucumber.md).

**Usage:** `cucumberReporter(reporter[, options])`

**Params:**
  * `reporter` *string* - Cucumber reporter name (`html|json|junit|message`) or path to a custom reporter file.
  * `options` *object* - Cucumber reporter options.

**Returns:** *array* - Playwright reporter tuple configuration.

Example usage in `playwright.config.ts`:
```ts
import { cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [
    cucumberReporter('html', { outputFile: `reports/report.html` }),
  ],
  // ...other options
});
```

### createBdd

Creates functions for defining steps and hooks.

**Usage:** `createBdd([test][, options])`

> Before Playwright-BDD **v7**, the second parameter was `WorldConstructor`.

**Params:**
  * `test` *object* - Test instance to provide access to custom fixtures in steps.
  * `options` *object* - Options:
    - `worldFixture` *string* - Name of the fixture to be used as a World in cucumber-style steps.
    - `tags` *string* - Default [tag expression](https://github.com/cucumber/tag-expressions) that will be applied to all steps/hooks.

**Returns:** *object* - `{ Given, When, Then, Step, BeforeScenario, AfterScenario, BeforeWorker, AfterWorker, Before, After, BeforeAll, AfterAll }`

By default, the produced functions work with [Playwright-style](writing-steps/playwright-style.md) steps. If `options.worldFixture` is defined, the produced functions work with [Cucumber-style](writing-steps/cucumber-style.md) steps.

### Given / When / Then / Step

Functions for step definitions.

**Usage:** 
 - `Given(pattern[, options], fn)`
 - `When(pattern[, options], fn)`
 - `Then(pattern[, options], fn)`
 - `Step(pattern[, options], fn)`

**Params:**
  * `pattern` *string | regexp* - [Cucumber expression](https://github.com/cucumber/cucumber-expressions) string or RegExp.
  * `options` *object* - Step options:
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to bind this step to specific features/scenarios.
  * `fn` *function* - Step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style).
    - `...args` *array* - Arguments captured from the step pattern.  

**Returns:** *function* - A function to call this step from other steps.

### BeforeStep

Defines a hook that runs **before each step**. You can target the hook to specific step by providing the `tags` option.

**Usage:** `BeforeStep([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/steps.
    - `name` *string* - An optional name for this hook for reporting.
    - `timeout` *number* - Timeout for this hook in milliseconds.
  * `hookFn` *Function* - Hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - List of tags for the current step.
      - Any other built-in and custom fixtures.

### AfterStep

Defines a hook that runs **after each scenario**. You can target the hook to specific step by providing the `tags` option.

**Usage:** `AfterStep([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/steps.
    - `name` *string* - An optional name for this hook for reporting.
    - `timeout` *number* - Timeout for this hook in milliseconds.
  * `hookFn` *Function* - Hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - List of tags for the current step.
      - Any other built-in and custom fixtures.

### BeforeScenario / Before

Defines a hook that runs **before each scenario**. You can target the hook to specific scenarios by providing the `tags` option. `BeforeScenario` and `Before` are aliases.

**Usage:** `BeforeScenario([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/scenarios.
    - `name` *string* - An optional name for this hook for reporting.
    - `timeout` *number* - Timeout for this hook in milliseconds.
  * `hookFn` *Function* - Hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - List of tags for the current scenario.
      - Any other built-in and custom fixtures.

### AfterScenario / After

Defines a hook that runs **after each scenario**. You can target the hook to specific scenarios by providing the `tags` option. `AfterScenario` and `After` are aliases.

**Usage:** `AfterScenario([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/scenarios.
    - `name` *string* - An optional name for this hook for reporting.
    - `timeout` *number* - Timeout for this hook in milliseconds.
  * `hookFn` *Function* - Hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - List of tags for the current scenario.
      - Any other built-in and custom fixtures.

### BeforeWorker / BeforeAll

Defines a hook that runs **once in each worker**, before all scenarios. You can target the hook to specific scenarios by providing the `tags` option. `BeforeWorker` and `BeforeAll` are aliases.

> Note that for worker hooks, it makes sense to provide only *feature-level tags*. Scenario-level tags will still trigger the hook run for the whole feature file, not for a particular scenario.

**Usage:** `BeforeWorker([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features.
    - `name` *string* - An optional name for this hook for reporting.
    - `timeout` *number* - Timeout for this hook in milliseconds.
  * `hookFn` *Function* - Hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo).
      - Any other built-in and custom **worker-scoped** fixtures.

### AfterWorker / AfterAll

Defines a hook that runs **once in each worker**, after all scenarios. You can target the hook to specific scenarios by providing the `tags` option. `AfterWorker` and `AfterAll` are aliases.

> Note that for worker hooks, it makes sense to provide only *feature-level tags*. Scenario-level tags will still trigger the hook run for the whole feature file, not for a particular scenario.

**Usage:** `AfterWorker([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to bind this hook to specific features.
    - `name` *string* - An optional name for this hook for reporting.
    - `timeout` *number* - Timeout for this hook in milliseconds.
  * `hookFn` *Function* - Hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo).
      - Any other built-in and custom **worker-scoped** fixtures.

### @Fixture

Class decorator to bind a Page Object Model (POM) with a fixture name.

**Usage:** `@Fixture(nameOrOptions)`

**Params:**
  * `nameOrOptions` *string* - Fixture name for the given class.
  * `nameOrOptions` *object* - Fixture options:
    - `name` *string* - Fixture name for the given class.
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to bind all steps of that class to specific features/scenarios.

It is also possible to provide the `test` type as a generic parameter to restrict `fixtureName` to available fixture names:
```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage { ... };
```

### @Given / @When / @Then / @Step

A decorator to mark a method as a BDD step.

**Usage:** 
  - `@Given(pattern[, options])`
  - `@When(pattern[, options])`
  - `@Then(pattern[, options])`
  - `@Step(pattern[, options])`

**Params:**
  * `pattern` *string | regexp* - Step pattern as a [cucumber expression](https://github.com/cucumber/cucumber-expressions) or RegExp.
  * `options` *object* - Step options:
    - `tags` *string* - [Tag expression](https://github.com/cucumber/tag-expressions) to bind this step to specific features/scenarios.
