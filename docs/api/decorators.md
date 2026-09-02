# Decorators

## `@Fixture`

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

## `@Given` / `@When` / `@Then` / `@Step`

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
