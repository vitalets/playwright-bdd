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

## Usage

The syntax is mostly similar to Cucumber Expressions, with a few additions:

- Named params, e.g. `:user` or `:count{int}`
- Inline choice params, e.g. `Set status {pending/approved/rejected}`
- Required multi-word alternatives, e.g. `I [click/tap on] the button`

Check out the full [syntax guide](https://vitalets.github.io/bdd-expressions/syntax/) and the [playground](https://vitalets.github.io/bdd-expressions/).

## Use cases

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

### Named params

Named parameters let you replace manually typed positional arguments with automatically typed `$step.params`. For example, the cart step above declares two positional arguments:

```ts
async ({ cart }, product: string, quantity?: number) => {
  await cart.add(product, quantity);
}
```

Name the parameters in the expression to infer their types instead:

```ts
When(
  'I add :product to the cart( with quantity :quantity{int})',
  { bddExpr: true },
  async ({ cart, $step }) => {
    const { product, quantity } = $step.params;
    await cart.add(product, quantity);
  },
);
```

`$step.params` is automatically typed:

```ts
{
  product: string;
  quantity: number | undefined;
}
```

A named parameter without an explicit type, such as `:product`, matches a quoted string. The feature steps stay the same.

## DocString and DataTable

The `{DocString}` and `{DataTable}` parameters let you explicitly make doc strings and data tables required or optional for step.

### Required DataTable

I you want the step always contain DataTable, end the expression with `{DataTable}`. Usually, steps with DataTable end with colon `:`. For example: 

```ts
Given('users in database:{DataTable}', { bddExpr: true }, ({ $step }, count: number) => {
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
