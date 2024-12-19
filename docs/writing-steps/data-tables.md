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
Check out all [methods of DataTable](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/data_table_interface.md) in the Cucumber docs.
