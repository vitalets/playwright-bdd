# API

### defineBddConfig

Defines BDD config inside Playwright config file.

**Usage:** `defineBddConfig(config)`

**Params:**
  * `config` *object* - BDD [configuration](configuration/index.md)

**Returns:** *string* - directory where test files will be generated

### defineBddProject
<div style="color: gray; font-size: 0.8em">Since <b>v7.0.0</b></div>

A thin wrapper around `defineBddConfig()` that makes BDD configuration of Playwright projects a bit easier. In addition to the standard BDD config, it accepts a project name and automatically sets [`outputDir`](configuration/options.md#outputdir) based on that name. The function returns an object `{ name, testDir }`, which can be merged into project config with spread operator.

**Usage:** `defineBddProject(config)`

**Params:**
  * `config` *object* - BDD [configuration](configuration/index.md) + project name `{ name: string }`

**Returns:** *{ name, testDir }* - object containing project name and generated tests directory

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
  * `reporter` *string* - Cucumber reporter name (`html|json|junit|message`) or path to custom reporter file
  * `options` *object* - Cucumber reporter options

**Returns:** *array* - Playwright reporter tuple configuration

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

!> Before playwright-bdd **v7** second parameter was `WorldConstructor`

**Params:**
  * `test` *object* - test instance to provide access to custom fixtures in steps
  * `options` *object* - options
    * `worldFixture` *string* - name of the fixture to be used as a World in cucumber-style steps

**Returns:** *object* - `{ Given, When, Then, Step, Before, After, BeforeAll, AfterAll }`

By default produced functions work with [Playwright-style](writing-steps/playwright-style.md) steps. If `options.worldFixture` is defined, then produced functions work with [Cucumber-style](writing-steps/cucumber-style.md) steps.

### Given
Defines `Given` step implementation.

**Usage:** `Given(pattern[, options], fn)`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns:** *function* - a function to call this step from other steps.

### When
Defines `When` step implementation.

**Usage:** `When(pattern[, options], fn)`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns:** *function* - a function to call this step from other steps.

### Then
Defines `Then` step implementation.

**Usage:** `Then(pattern[, options], fn)`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios  
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns:** *function* - a function to call this step from other steps.

### Step
Defines universal step implementation.

**Usage:** `Step(pattern[, options], fn)`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios  
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns:** *function* - a function to call this step from other steps.

### Before
Defines `Before` hook: runs before each scenario. Scenarios can be filtered by tags.

**Usage:** `Before([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) used to apply this hook to only specific scenarios
    - `timeout` *number* - timeout for this hook in milliseconds
    - `name` *string* - an optional name for this hook
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo)
      - `$tags` *string[]* - list of tags for current scenario
      - any other built-in and custom fixtures

### After
Defines `After` hook: runs after each scenario. Scenarios can be filtered by tags.

**Usage:** `After([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) used to apply this hook to only specific scenarios
    - `timeout` *number* - timeout for this hook in milliseconds
    - `name` *string* - an optional name for this hook
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo)
      - `$tags` *string[]* - list of tags for current scenario
      - any other built-in and custom fixtures

### BeforeAll
Defines `BeforeAll` hook: runs once in each worker.

**Usage:** `BeforeAll([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `timeout` *number* - timeout for this hook in milliseconds
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo)
      - any other built-in and custom **worker-scoped** fixtures

### AfterAll
Defines `AfterAll` hook: runs once in each worker.

**Usage:** `AfterAll([options,] hookFn)`

**Params:**
  * `options` *string | object*
    - `timeout` *number* - timeout for this hook in milliseconds
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo)
      - any other built-in and custom **worker-scoped** fixtures

### @Fixture
Class decorator to bind Page Object Model (POM) with fixture name.

**Usage:** `@Fixture(fixtureName)`

**Params:**
  * `fixtureName` *string* - fixture name for the given class.

It is also possible to provide `test` type as a generic parameter to restrict `fixtureName` to available fixture names:
```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage { ... };
```

### @Given
Method decorator to define `Given` step.

**Usage:** `@Given(pattern[, options])`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios

### @When
Method decorator to define `When` step.

**Usage:** `@When(pattern[, options])`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios

### @Then
Method decorator to define `Then` step.

**Usage:** `@Then(pattern[, options])`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios

### @Step
Method decorator to define universal step.

**Usage:** `@Step(pattern[, options])`

**Params:**
  * `pattern` *string | regexp* - step pattern
  * `options` *object* - step options
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) to match this step to specific features/scenarios