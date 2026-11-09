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

### Named params

You can use named params accessible via `$step.params`:

```ts
Given('I buy :count{int} apples', { bddExpr: true }, async ({ $step }) => {
  console.log('count:', $step.params.count);
});
```

`$step.params` is automatically typed:

```typescript
// $step.params
{ 
  count: number; 
}
```

### Optional text with params

An optional group can contain a parameter. Use this to handle both page-wide actions and actions scoped to a dialog without separate step definitions:

```ts
When('I click :button( in the :dialog dialog)', async ({ page, $step }) => {
  const { button, dialog } = $step.params;
  const scope = dialog === undefined ? page : page.getByRole('dialog', { name: dialog });
  await scope.getByRole('button', { name: button, exact: true }).click();
});
```

Both steps match this definition:

```gherkin
When I click "Save"
When I click "Save" in the "Edit profile" dialog
```

The `dialog` parameter is `undefined` when the optional group is omitted. A named parameter without an explicit type, such as `:button`, matches a quoted string.

### Related assertions with inline choices

Inline choices capture one of a fixed set of values without registering a custom parameter type. Combine visible and hidden checks in one assertion step:

```ts
Then('the :button button is :state{visible/hidden}', async ({ page, $step }) => {
  const { button, state } = $step.params;
  const locator = page.getByRole('button', { name: button, exact: true });
  if (state === 'visible') {
    await expect(locator).toBeVisible();
  } else {
    await expect(locator).toBeHidden();
  }
});
```

```gherkin
Then the "Submit" button is visible
Then the "Submit" button is hidden
```

The `state` parameter is inferred as `'visible' | 'hidden'`. Other values do not match this definition.

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

✅ Matches — colon and data table provided:

```gherkin
Given 1 user in database:
  | name  |
  | Alice |
```

✅ Matches — both omitted:

```gherkin
Given 2 users in database
```

❌ Does not match — colon without a table:

```gherkin
Given 2 users in database:
```

❌ Does not match — table without a colon:

```gherkin
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
