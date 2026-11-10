# BDD Expressions

> **Experimental · Opt-in · Feedback welcome**

[BDD Expressions](https://github.com/vitalets/bdd-expressions) is an alternative syntax for step definitions, that extends Cucumber Expressions. They let you combine related step variations in one definition while keeping feature files readable. They support named parameters, inline choices, optional and required groups, and other improvements. 

## How to enable

You can enable BDD expressions for all steps by setting `bddExpr: true` in the `createBdd()` options:

```ts
export const { Given, When, Then } = createBdd(test, { 
  bddExpr: true // <-- enable BDD expressions for all steps
});

Given('bdd-expression', () => { ... });
```

Or you can enable individually for particular step:

```ts
Given('bdd-expression', { bddExpr: true }, () => { ... });
```

## Syntax

The syntax is similar to Cucumber Expressions, with a few additions:

- Named params, e.g. `:user` or `:count{int}`
- Inline choice params, e.g. `Set status {pending/approved/rejected}`
- Optional text with params, e.g. `I create a new user( with :name)`
- Multi-word alternatives, e.g. `I [click/tap on] the button`

Check out the full [syntax guide](https://vitalets.github.io/bdd-expressions/syntax/) and the [playground](https://vitalets.github.io/bdd-expressions/).

## Automatic types

With `bddExpr: true`, TypeScript automatically infers parameters types. You don't need to write types yourself:

```ts
Given('count {int}', { bddExpr: true }, ({}, count) => {
  // ...
});
```

<img src="writing-steps/_media/bdd-expression-positional-inference.png" alt="Editor tooltip showing the positional count parameter inferred as number." style="width: 100%; max-width: 720px; height: auto;">

Optional parameter types include `undefined`:

```ts
Given('count {int}( for :owner)', { bddExpr: true }, ({}, count, owner) => {
  // ...
});
```

<img src="writing-steps/_media/bdd-expression-optional-param.png" alt="Editor tooltip showing the optional owner parameter inferred as string | undefined." style="width: 100%; max-width: 720px; height: auto;">

In case of incorrect types, you'll see an error:

<img src="writing-steps/_media/bdd-expression-positional-validation.png" alt="TypeScript underlines the callback because count is annotated as string but {int} produces a number." style="width: 100%; max-width: 720px; height: auto;">

Custom parameter types remain unchecked because their transformers are registered at runtime.

## Named params

Named parameters let you access captured values through automatically typed `$step.params` instead of positional arguments. 

```ts
When('I add :product to the cart', { bddExpr: true }, async ({ $step }) => {
  const { product } = $step.params;
  // ...
});
```

`$step.params` is automatically typed:

<img src="writing-steps/_media/bdd-expression-params.png" alt="Editor tooltip showing $step.params inferred as product: string and quantity: number | undefined" style="width: 100%; max-width: 720px; height: auto;">

## Use cases

The use cases below show how you can collapse mulitple step definitions into one, keeping your codebase cleaner.

### Optional text with params

An optional group can contain a parameter. Use this to combine adding a product to the cart with or without a specific quantity in one step definition:

```diff
- I add {string} to the cart
- I add {string} to the cart with quantity {int}
+ I add {string} to the cart( with quantity {int})
```

The following example uses a `cart` fixture with an `add` method:

```ts
When(
  'I add {string} to the cart( with quantity {int})',
  { bddExpr: true },
  async ({ cart }, product: string, quantity?: number) => {
    await cart.add(product, quantity);
  },
);
```

Both steps match this definition:

```gherkin
When I add "Notebook" to the cart
When I add "Notebook" to the cart with quantity 3
```

The quantity parameter is `undefined` when the optional group is omitted.

### Inline choices

Inline choices capture one of a fixed set of values without registering a custom parameter type. Combine visible and hidden checks in one assertion step:

```diff
- the {string} button is visible
- the {string} button is hidden
+ the {string} button is {visible/hidden}
```

```ts
Then(
  'the {string} button is {visible/hidden}',
  { bddExpr: true },
  async ({ page }, button: string, state: 'visible' | 'hidden') => {
    if (state === 'visible') {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).toBeHidden();
    }
  },
);
```

```gherkin
Then the "Submit" button is visible
Then the "Submit" button is hidden
```

The state parameter only accepts `visible` or `hidden`. Other values do not match this definition.

### Replace regular expressions

Use inline choices to replace regular expressions that capture a fixed set of values. For example, a step that checks a connection indicator can use a readable BDD expression:

```diff
- /^the connection indicator is (green|red)$/
+ 'the connection indicator is {green/red}'
```

```ts
Then(
  'the connection indicator is {green/red}',
  { bddExpr: true },
  async ({ page }, color: 'green' | 'red') => {
    await expect(page.getByTestId('connection-indicator')).toHaveAttribute('data-color', color);
  },
);
```

Both versions match the entire step and pass the captured color to the callback:

```gherkin
Then the connection indicator is green
Then the connection indicator is red
```

## DocString and DataTable

The `{DocString}` and `{DataTable}` parameters let you explicitly make doc strings and data tables required or optional for step.

### Required DataTable

I you want the step always contain DataTable, end the expression with `{DataTable}`. Usually, steps with DataTable end with colon `:`. For example: 

```ts
Given('users in database:{DataTable}', { bddExpr: true }, ({ $step }) => {
  // use `$step.dataTable` for step actions.
});
```

✅ Matches (colon and data table provided):

```gherkin
Given users in database:
  | Alice |
  | Bob   |
```

❌ Does not match (data table missing):

```gherkin
Given users in database:
```

### Optional DataTable

Use `(:{DataTable})` to make the colon and table optional together. Additionally, you can add `{int}` param for count. For example:

```ts
Given('{int} user(s) in database(:{DataTable})', ({ $step }, count: number) => {
  // use `count` and `$step.dataTable` for step actions.
});
```

✅ Matches:

```gherkin
Given 0 users in database
Given 1 user in database:
  | Alice |
Given 2 users in database:
  | Alice |
  | Bob   |
```

❌ Does not match:

```gherkin
Given 2 users in database:
Given 1 user in database
  | name  |
  | Alice |
```

`{DocString}` works the same way; an empty doc string counts as present. A `{DataTable}` definition rejects a doc string, and vice versa.

## IDE support

The [Cucumber (Gherkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) and [Official Cucumber extension](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official) extensions for VS Code do not yet support BDD Expressions syntax. Editor features such as step completion and navigation to step definitions will not work for these expressions. We plan to address this limitation in a future update.

## Usage with decorator steps

For [decorator steps](writing-steps/decorators.md), enable BDD expressions for an individual step with the `bddExpr: true` option. Captured values are passed as positional method arguments, which you type explicitly:

```ts
import { expect, type Page } from '@playwright/test';
import { Fixture, Then } from 'playwright-bdd/decorators';

export @Fixture('cartPage') class CartPage {
  constructor(private page: Page) {}

  @Then('the cart contains :count{int} item(s)', { bddExpr: true })
  async checkItemCount(count: number) {
    await expect(this.page.getByTestId('cart-item')).toHaveCount(count);
  }
}
```

With `bddExpr: true`, TypeScript checks your method's parameter types against the expression, including inline choices and optional values:

<video controls preload="metadata" style="width: 100%; max-width: 720px; height: auto; display: block; margin: 1em 0;" aria-label="Decorator step parameter type validation demo">
  <source src="writing-steps/_media/decorator-step-validation.mp4" type="video/mp4">
</video>

 Custom parameter types remain unchecked.

?> `$step.params` is not automatically typed in decorator steps, so we recommend using positional arguments here.

To enable BDD expressions for all step decorators returned by a factory, use [`createBddDecorators({ bddExpr: true })`](writing-steps/decorators.md#configured-decorators).

```ts
import { createBddDecorators } from 'playwright-bdd';

export const { Fixture, Given, When, Then, Step } = createBddDecorators({
  bddExpr: true,
});
```

## Usage with Cucumber-style steps

For Cucumber-style steps, expose the `$step` fixture on your world to access named values:

```ts
import { createBdd, test as base, type BddTestFixtures } from 'playwright-bdd';

type World = { 
  $step: BddTestFixtures['$step'] 
};

const test = base.extend<{ world: World }>({
  world: ({ $step }, use) => use({ $step }),
});

const { Given } = createBdd(test, { 
  worldFixture: 'world', 
  bddExpr: true,
});

Given('I buy :count{int} apples', function () {
  // this.$step.params.count is inferred as number.
});
```

## Migrate with an agent

Copy-paste this prompt into your coding agent to assess how BDD Expressions can improve your existing step definitions.

<details class="agent-prompt">
<summary><span class="agent-prompt__icon" aria-hidden="true">🤖</span><span class="agent-prompt__title"><span class="agent-prompt__prefix">Agent instruction:</span> <span class="agent-prompt__action">Migrate existing step definitions to BDD Expressions</span></span></summary>

<div class="agent-prompt__body">

````text
Review all step definitions in this project and propose improvements using BDD Expressions, available since Playwright BDD v10.

- Consolidate similar definitions using optional or required groups with parameters.
- Propose inline choices instead of general string types for finite values.
- Add explicit `{DocString}` / `{DataTable}` parameters where already used.
- Preserve existing feature wording where practical.
- Present concise proposals grouped by file. Show old and new expressions as Git-style diffs, making it clear which definitions collapse into one.
- Do not modify files until approved.

Example output:

**`features/steps/cart.steps.ts`**

```diff
- I add {string} to the cart
- I add {string} to the cart with quantity {int}
+ I add {string} to the cart( with quantity {int})

- the cart contains {int} item(s)
- the cart contains {int} item(s):
+ the cart contains {int} item(s)(:{DataTable})
```
````

</div>
</details>