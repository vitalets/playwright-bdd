# BDD Expressions

> **Experimental · Opt-in**

[BDD Expressions](https://github.com/vitalets/bdd-expressions) is an alternative step definition syntax that supersets Cucumber Expressions. It adds support for named parameters, inline choices, optional groups with parameters, and other improvements.

## How to enable

You can enable BDD expressions globally by setting `bddExpr: true` in the `createBdd()` options:

```ts
export const { Given, When, Then } = createBdd(test, { 
  bddExpr: true // <-- enable BDD expressions
});
```

Or you can enable individually for particular step:

```ts
Given('...', { bddExpr: true }, () => { ... });
```

## Usage

Define step matching string in BDD expression syntax and use `$step.params` to access matched values:

```ts
Given('I buy :count{int} apples( for :owner)', { bddExpr: true }, async ({ $step }) => {
  const params = $step.params;
  // params type: 
  // { 
  //   count: number; 
  //   owner: string | undefined 
  // }
});
```

`$step.params` exposes named values, with `undefined` for absent optional parameters. It is available in step hooks as well.

Positional arguments keep their existing order and behavior:

```ts
Given('I buy :count{int} apples( for :owner)', { bddExpr: true }, async ({}, count: number, owner?: string) => {
  // ...
});
```

When the expression does not declare a doc string or data table, either remains an optional final argument as before. Steps without named parameters expose an empty object.

For non BDD expression steps, `$step.params` is an empty object `{}` typed as `Record<string, unknown>`.

## DocString and DataTable parameters

The `{DocString}` and `{DataTable}` parameters let you make doc strings and data tables required or optional.

### Required DataTable

End the expression with `:{DataTable}`:

```ts
const { Given } = createBdd(test, { bddExpr: true });

Given('there are {int} user(s):{DataTable}', ({ $step }, count: number) => {
  // use `count` and `$step.dataTable` for step actions.
});
```

✅ Matches — colon and data table provided:

```gherkin
Given there are 2 users:
  | name  |
  | Alice |
  | Bob   |
```

❌ Does not match — data table missing:

```gherkin
Given there are 1 user:
```

### Optional DataTable

Use `(:{DataTable})` to make the colon and table optional together:

```ts
Given('there are {int} user(s)(:{DataTable})', ({ $step }, count: number) => {
  // use `count` and `$step.dataTable` for step actions.
});
```

✅ Matches — colon and data table provided:

```gherkin
Given there are 1 user:
  | name  |
  | Alice |
```

✅ Matches — both omitted:

```gherkin
Given there are 2 users
```

❌ Does not match — colon without a table:

```gherkin
Given there are 2 users:
```

❌ Does not match — table without a colon:

```gherkin
Given there are 1 user
  | name  |
  | Alice |
```

`{DocString}` works the same way; an empty doc string counts as present. A `{DataTable}` definition rejects a doc string, and vice versa.

Required doc string and data table parameters give `$step.docString` and `$step.dataTable` non-optional types. Optional values include `undefined`. Both are also available as positional callback arguments.

Doc string and data table parameters must come last. Without them, steps keep accepting doc strings or data tables as before. See the [syntax rules](https://github.com/vitalets/bdd-expressions/blob/main/docs/syntax.md) for details.

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
