# Using `DataTables`

Playwright-BDD provides full support of [`DataTables`](https://cucumber.io/docs/gherkin/reference/#data-tables).
For example:
```gherkin
Feature: Some feature

    Scenario: Login
        When I fill login form with values
          | label     | value    |
          | Username  | vitalets |
          | Password  | 12345    |
```

Step definition:
```ts
import { createBdd, DataTable } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

When('I fill login form with values', async ({ page }, data: DataTable) => {
  for (const row of data.hashes()) {
    await page.getByLabel(row.label).fill(row.value);
  }
  /*
  data.hashes() returns:
  [
    { label: 'Username', value: 'vitalets' },
    { label: 'Password', value: '12345' }
  ]
  */
});
```

See the [`DataTable` API reference](api/data-table.md) for all available methods and examples.

## Optional data tables

There may be cases where you need a step with an optional data table. For example, both of the following steps can be handled by the same step definition:

```gherkin
Scenario: No items
  Then there are 0 items

Scenario: Two items
  Then there are 2 items:
    | apple  |
    | orange |
```

Both variants match the same step definition. At runtime, the `DataTable` argument is passed only when the table is present. Declare the argument as optional and disable the arity check for that definition:

```ts
Then(
  'there are {int} items(:)',
  { arityCheck: false },
  async ({ page }, count: number, dataTable?: DataTable) => {
    const rows = dataTable?.raw() ?? [];
    // ...
  },
);
```
