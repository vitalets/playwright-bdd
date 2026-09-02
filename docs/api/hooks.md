# Hooks

## `BeforeWorker` / `BeforeAll`

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

## `AfterWorker` / `AfterAll`

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

## `BeforeScenario` / `Before`

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

## `AfterScenario` / `After`

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

## `BeforeStep`

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

## `AfterStep`

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
