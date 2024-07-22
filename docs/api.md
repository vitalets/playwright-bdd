# API

### `defineBddConfig(config)`

Defines BDD config inside Playwright config file.

**Params**
  * `config` *object* - BDD [configuration](configuration/index.md)

**Returns**: *string* - directory where test files will be generated

### `defineBddProject(config)`
<div style="color: gray; font-size: 0.8em">Since <b>v7.0.0</b></div>

A thin wrapper around `defineBddConfig()` that makes BDD configuration of Playwright projects a bit easier. In addition to the standard BDD config, it accepts a project name and automatically sets [`outputDir`](configuration/options.md#outputdir) based on that name. The function returns an object `{ name, testDir }`, which can be merged into project config with spread operator.

**Params**
  * `config` *object* - BDD [configuration](configuration/index.md) + project name `{ name: string }`

**Returns**: *{ name, testDir }* - object containing project name and generated tests directory

**Usage**:
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
    
```   

### `cucumberReporter(reporter, options?)`
Helper to output test results in various [Cucumber reporters](reporters/cucumber.md).

**Params**
  * `reporter` *string* - Cucumber reporter name (`html|json|junit|message`) or path to custom reporter file
  * `options` *object* - Cucumber reporter options

**Returns**: *array* - Playwright reporter tuple configuration

Usage in `playwright.config.ts`:
```ts
import { cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [
    cucumberReporter('html', { outputFile: `reports/report.html` }),
  ],
  // ...other options
});
```

### `createBdd(test?, options?)`

!> Before v7 second parameter was `WorldConstructor`

Creates:
 * `Given`, `When`, `Then`, `Step` functions for defining steps
 * `Before`, `After`, `BeforeAll`, `AfterAll` functions for defining hooks

By default produced functions work with [Playwright-style](writing-steps/playwright-style.md) steps. If `options.worldFixture` is defined, then produced functions work with [Cucumber-style](writing-steps/cucumber-style.md) steps.

**Params**
  * `test` *object* - test instance to provide access to custom fixtures in steps
  * `options` *object* - options
    * `worldFixture` *string* - name of the fixture to be used as a World in cucumber-style steps

**Returns**: *object* - `{ Given, When, Then, Step, Before, After, BeforeAll, AfterAll }`

### `Given(pattern, fn)`
Defines `Given` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns**: *function* - a function to call this step from other steps.

### `When(pattern, fn)`
Defines `When` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns**: *function* - a function to call this step from other steps.

### `Then(pattern, fn)`
Defines `Then` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns**: *function* - a function to call this step from other steps.

### `Step(pattern, fn)`
Defines universal step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures (omitted in cucumber-style)
    - `...args` *array* - arguments captured from step pattern  

**Returns**: *function* - a function to call this step from other steps.

### `Before(options?, hookFn)`
Defines `Before` hook.

**Params**
  * `options` *string | object*
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) used to apply this hook to only specific scenarios
    - `timeout` *number* - timeout for this hook in milliseconds
    - `name` *string* - an optional name for this hook
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo)
      - `$tags` *string[]* - list of tags for current scenario
      - any other built-in and custom fixtures

### `After(options?, hookFn)`
Defines `After` hook.

**Params**
  * `options` *string | object*
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) used to apply this hook to only specific scenarios
    - `timeout` *number* - timeout for this hook in milliseconds
    - `name` *string* - an optional name for this hook
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo)
      - `$tags` *string[]* - list of tags for current scenario
      - any other built-in and custom fixtures

### `BeforeAll(options?, hookFn)`
Defines `BeforeAll` hook.

**Params**
  * `options` *string | object*
    - `timeout` *number* - timeout for this hook in milliseconds
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo)
      - any other built-in and custom **worker-scoped** fixtures

### `AfterAll(options?, hookFn)`
Defines `AfterAll` hook.

**Params**
  * `options` *string | object*
    - `timeout` *number* - timeout for this hook in milliseconds
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo)
      - any other built-in and custom **worker-scoped** fixtures

### `@Fixture(fixtureName)`
Class decorator to bind POM with fixture name.

**Params**
  * `fixtureName` *string* - fixture name for the given class.

It is also possible to provide `test` type as a generic parameter to restrict `fixtureName` to available fixture names:
```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage { ... };
```

### `@Given(pattern)`
Method decorator to define `Given` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@When(pattern)`
Method decorator to define `When` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@Then(pattern)`
Method decorator to define `Then` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@Step(pattern)`
Method decorator to define universal step.

**Params**
  * `pattern` *string | regexp* - step pattern
