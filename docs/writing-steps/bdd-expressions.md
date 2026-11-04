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

Doc strings and data tables remain the final argument. Steps without named parameters expose an empty object.

For non BDD expression steps, `$step.params` is an empty object `{}` typed as `Record<string, unknown>`.

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
