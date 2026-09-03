# API

## `defineBddConfig()` :id=definebddconfig

Defines BDD config inside the Playwright config file.

**Usage:** `defineBddConfig(config)`

**Params:**

- `config` _object_ - BDD [configuration](configuration/index.md)

**Returns:** _string_ - Directory where test files will be generated.

## `defineBddProject()` :id=definebddproject

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

## `cucumberReporter()` :id=cucumber-reporter

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

## `createBdd()` :id=createbdd

Creates functions for defining steps and hooks.

**Usage:** `createBdd([test][, options])`

> Before Playwright-BDD **v7**, the second parameter was `WorldConstructor`.

**Params:**

- `test` _object_ - Test instance to provide access to custom fixtures in steps.
- `options` _object_ - Options:
  - `worldFixture` _string_ - Name of the fixture to be used as a World in cucumber-style steps.
  - `tags` _string_ - Default [tag expression](https://github.com/cucumber/tag-expressions) that will be applied to all steps/hooks.

**Returns:** _object_ - `{ Given, When, Then, Step, BeforeStep, AfterStep, BeforeScenario, AfterScenario, BeforeWorker, AfterWorker, Before, After, BeforeAll, AfterAll }`

By default, the produced functions work with [Playwright-style](writing-steps/playwright-style.md) steps. If `options.worldFixture` is defined, the produced functions work with [Cucumber-style](writing-steps/cucumber-style.md) steps.

## `Given()` / `When()` / `Then()` / `Step()` :id=steps

Functions for step definitions.

**Usage:**

- `Given(pattern[, options], fn)`
- `When(pattern[, options], fn)`
- `Then(pattern[, options], fn)`
- `Step(pattern[, options], fn)`

**Params:**

- `pattern` _string | regexp_ - [Cucumber expression](https://github.com/cucumber/cucumber-expressions) string or RegExp.
- `options` _object_ - Step options:
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to bind this step to specific features/scenarios.
  - `arityCheck` _boolean_ - Overrides the config-level [`arityCheck`](configuration/options.md#aritycheck) for this step definition.
- `fn` _function_ - Step function `(fixtures, ...args) => void`:
  - `fixtures` _object_ - Playwright fixtures (omitted in cucumber-style).
  - `...args` _array_ - Arguments captured from the step pattern.

**Returns:** _function_ - A function to call this step from other steps.

## `defineParameterType()` :id=define-parameter-type

Defines a custom parameter type using a regular expression and an optional transformer function.

**Signature:** `defineParameterType(options)`

**Params:**

- `options` _object_
  - `name` _string_ - Name to refer to this type in cucumber expressions.
  - `regexp` _RegExp_ - A regular expression to match the parameter.
  - `transformer` _Function_ - An optional function which transforms the captured argument from a string into another type. If no transform function is specified, the captured argument is left as a string.

**Usage:**

```ts
import { defineParameterType } from 'playwright-bdd';

type Color = 'red' | 'blue' | 'yellow';
defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

Then('The color is {color}', async ({}, color: Color) => {
  // ...
});
```

## `BeforeWorker()` / `BeforeAll()` :id=before-worker

Defines a hook that runs **once in each worker**, before all scenarios. You can target the hook to specific scenarios by providing the `tags` option. `BeforeWorker` and `BeforeAll` are aliases.

> Note that for worker hooks, it makes sense to provide only _feature-level tags_. Scenario-level tags will still trigger the hook run for the whole feature file, not for a particular scenario.

**Usage:** `BeforeWorker([options,] hookFn)`

**Params:**

- `options` _string | object_
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features.
  - `name` _string_ - An optional name for this hook for reporting.
  - `timeout` _number_ - Timeout for this hook in milliseconds.
- `hookFn` _Function_ - Hook function `(fixtures?) => void`:
  - `fixtures` _object_ - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
    - `$workerInfo` _object_ - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo).
    - Any other built-in and custom **worker-scoped** fixtures.

?> If you need to run hook **once for all workers**, check out [Running hook once](writing-steps/hooks/running-hook-once.md).

## `AfterWorker()` / `AfterAll()` :id=after-worker

Defines a hook that runs **once in each worker**, after all scenarios. You can target the hook to specific scenarios by providing the `tags` option. `AfterWorker` and `AfterAll` are aliases.

> Note that for worker hooks, it makes sense to provide only _feature-level tags_. Scenario-level tags will still trigger the hook run for the whole feature file, not for a particular scenario.

**Usage:** `AfterWorker([options,] hookFn)`

**Params:**

- `options` _string | object_
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to bind this hook to specific features.
  - `name` _string_ - An optional name for this hook for reporting.
  - `timeout` _number_ - Timeout for this hook in milliseconds.
- `hookFn` _Function_ - Hook function `(fixtures?) => void`:
  - `fixtures` _object_ - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
    - `$workerInfo` _object_ - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo).
    - Any other built-in and custom **worker-scoped** fixtures.

## `BeforeScenario()` / `Before()` :id=before-scenario

Defines a hook that runs **before each scenario**. You can target the hook to specific scenarios by providing the `tags` option. `BeforeScenario` and `Before` are aliases.

**Usage:** `BeforeScenario([options,] hookFn)`

**Params:**

- `options` _string | object_
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/scenarios.
  - `name` _string_ - An optional name for this hook for reporting.
  - `timeout` _number_ - Timeout for this hook in milliseconds.
- `hookFn` _Function_ - Hook function `(fixtures?) => void`:
  - `fixtures` _object_ - Playwright fixtures:
    - `$testInfo` _object_ - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
    - `$tags` _string[]_ - List of tags for the current scenario.
    - Any other built-in and custom fixtures.

## `AfterScenario()` / `After()` :id=after-scenario

Defines a hook that runs **after each scenario**. You can target the hook to specific scenarios by providing the `tags` option. `AfterScenario` and `After` are aliases.

**Usage:** `AfterScenario([options,] hookFn)`

**Params:**

- `options` _string | object_
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/scenarios.
  - `name` _string_ - An optional name for this hook for reporting.
  - `timeout` _number_ - Timeout for this hook in milliseconds.
- `hookFn` _Function_ - Hook function `(fixtures?) => void`:
  - `fixtures` _object_ - Playwright fixtures:
    - `$testInfo` _object_ - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
    - `$tags` _string[]_ - List of tags for the current scenario.
    - Any other built-in and custom fixtures.

## `BeforeStep()` :id=before-step

Defines a hook that runs **before each step**. You can target the hook to a specific step by providing the `tags` option.

**Usage:** `BeforeStep([options,] hookFn)`

**Params:**

- `options` _string | object_
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/steps.
  - `name` _string_ - An optional name for this hook for reporting.
  - `timeout` _number_ - Timeout for this hook in milliseconds.
- `hookFn` _Function_ - Hook function `(fixtures?) => void`:
  - `fixtures` _object_ - Playwright fixtures:
    - `$testInfo` _object_ - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
    - `$tags` _string[]_ - List of tags for the current step.
    - Any other built-in and custom fixtures.

## `AfterStep()` :id=after-step

Defines a hook that runs **after each invoked step**. You can target the hook to a specific step by providing the `tags` option.

If the step body throws, the thrown value is available as `$step.error` inside `AfterStep`. Use `$step.error` instead of `$testInfo.status` for per-step failure handling, and handle skipped or other control-flow errors according to your project needs. Playwright hard timeouts and interruptions can still abort execution before `AfterStep` runs.

**Usage:** `AfterStep([options,] hookFn)`

**Params:**

- `options` _string | object_
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to target this hook to specific features/steps.
  - `name` _string_ - An optional name for this hook for reporting.
  - `timeout` _number_ - Timeout for this hook in milliseconds.
- `hookFn` _Function_ - Hook function `(fixtures?) => void`:
  - `fixtures` _object_ - Playwright fixtures:
    - `$testInfo` _object_ - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
    - `$tags` _string[]_ - List of tags for the current step.
    - `$step` _object_ - Current step info, including `$step.error` when the step body throws.
    - Any other built-in and custom fixtures.

## `@Fixture` :id=fixture-decorator

Class decorator to bind a Page Object Model (POM) with a fixture name.

**Usage:** `@Fixture(nameOrOptions)`

**Params:**

- `nameOrOptions` _string_ - Fixture name for the given class.
- `nameOrOptions` _object_ - Fixture options:
  - `name` _string_ - Fixture name for the given class.
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to bind all steps of that class to specific features/scenarios.

It is also possible to provide the `test` type as a generic parameter to restrict `fixtureName` to available fixture names:

```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  // ...
}
```

## `@Given` / `@When` / `@Then` / `@Step` :id=step-decorators

A decorator to mark a method as a BDD step.

**Usage:**

- `@Given(pattern[, options])`
- `@When(pattern[, options])`
- `@Then(pattern[, options])`
- `@Step(pattern[, options])`

**Params:**

- `pattern` _string | regexp_ - Step pattern as a [Cucumber expression](https://github.com/cucumber/cucumber-expressions) or RegExp.
- `options` _object_ - Step options:
  - `tags` _string_ - [Tag expression](https://github.com/cucumber/tag-expressions) to bind this step to specific features/scenarios.
  - `arityCheck` _boolean_ - Overrides the config-level [`arityCheck`](configuration/options.md#aritycheck) for this step definition.

**Multiple decorators:**

You can apply multiple step decorators to the same method to support different phrasings:

```ts
@Fixture('todoPage')
export class TodoPage {
  @When('a item {string} exists')
  @When('a item called {string} is added')
  async addItem(itemName: string) {
    await this.inputField.fill(itemName);
    await this.addItemButton.click();
  }
}
```

Each decorator registers a separate step definition that points to the same implementation. This is useful for:

- Supporting natural language variations
- Accommodating different team members' writing styles
- Avoiding complex regex patterns

## `DataTable` :id=data-table

The `DataTable` class provides methods for transforming a Gherkin data table into arrays or objects. Import it from `playwright-bdd` and use it as the type of the last argument in a step definition:

```ts
import { createBdd, DataTable } from 'playwright-bdd';

const { When } = createBdd();
```

All cell values are returned as strings.

### `hashes()` :id=data-table-hashes

**Signature:** `hashes(): Record<string, string>[]`

Returns each data row as an object. The first row supplies the property names and is not included in the result.

```gherkin
When I convert the following products to objects
  | name     | price |
  | Cucumber | 2     |
  | Tomato   | 3     |
```

```ts
When('I convert the following products to objects', async ({}, dataTable: DataTable) => {
  const products = dataTable.hashes();

  // products:
  // [
  //   { name: 'Cucumber', price: '2' },
  //   { name: 'Tomato', price: '3' },
  // ]
});
```

### `raw()` :id=data-table-raw

**Signature:** `raw(): string[][]`

Returns all rows as a two-dimensional array, including the first row.

```gherkin
When I read the following raw table
  | name     | price |
  | Cucumber | 2     |
  | Tomato   | 3     |
```

```ts
When('I read the following raw table', async ({}, dataTable: DataTable) => {
  const table = dataTable.raw();

  // table:
  // [
  //   ['name', 'price'],
  //   ['Cucumber', '2'],
  //   ['Tomato', '3'],
  // ]
});
```

### `rows()` :id=data-table-rows

**Signature:** `rows(): string[][]`

Returns all rows except the first row. This is useful when the first row contains column headings but you want positional arrays instead of objects.

```gherkin
When I read the following product rows
  | name     | price |
  | Cucumber | 2     |
  | Tomato   | 3     |
```

```ts
When('I read the following product rows', async ({}, dataTable: DataTable) => {
  const products = dataTable.rows();

  // products:
  // [
  //   ['Cucumber', '2'],
  //   ['Tomato', '3'],
  // ]
});
```

### `rowsHash()` :id=data-table-rows-hash

**Signature:** `rowsHash(): Record<string, string>`

Converts a two-column table into an object. The first column supplies the property names and the second column supplies the values.

```gherkin
When I log in with the following details
  | username | vitalets |
  | password | 12345    |
```

```ts
When('I log in with the following details', async ({}, dataTable: DataTable) => {
  const credentials = dataTable.rowsHash();

  // credentials:
  // {
  //   username: 'vitalets',
  //   password: '12345',
  // }
});
```

Every row must contain exactly two cells. Otherwise, `rowsHash()` throws an error.

### `transpose()` :id=data-table-transpose

**Signature:** `transpose(): DataTable`

Returns a new `DataTable` with its rows and columns exchanged. You can call any `DataTable` method on the result.

```gherkin
When I transpose the following table
  | name     | Cucumber | Tomato |
  | price    | 2        | 3      |
```

```ts
When('I transpose the following table', async ({}, dataTable: DataTable) => {
  const transposed = dataTable.transpose().raw();

  // transposed:
  // [
  //   ['name', 'price'],
  //   ['Cucumber', '2'],
  //   ['Tomato', '3'],
  // ]
});
```
