# Steps

## `createBdd`

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

## `Given` / `When` / `Then` / `Step`

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

## `defineParameterType`

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
