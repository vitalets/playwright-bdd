# DataTable

The `DataTable` class provides methods for transforming a Gherkin data table into arrays or objects. Import it from `playwright-bdd` and use it as the type of the last argument in a step definition:

```ts
import { createBdd, DataTable } from 'playwright-bdd';

const { When } = createBdd();
```

All cell values are returned as strings.

## `hashes()`

**Signature:** `hashes(): Record<string, string>[]`

Returns each data row as an object. The first row supplies the property names and is not included in the result.

```gherkin
When I convert the following products to objects
  | name     | price |
  | Cucumber | 2     |
  | Tomato   | 3     |
```

```ts
When('I convert the following products to objects', async ({}, dataTable: DataTable) => {
  const products = dataTable.hashes();

  // products:
  // [
  //   { name: 'Cucumber', price: '2' },
  //   { name: 'Tomato', price: '3' },
  // ]
});
```

## `raw()`

**Signature:** `raw(): string[][]`

Returns all rows as a two-dimensional array, including the first row.

```gherkin
When I read the following raw table
  | name     | price |
  | Cucumber | 2     |
  | Tomato   | 3     |
```

```ts
When('I read the following raw table', async ({}, dataTable: DataTable) => {
  const table = dataTable.raw();

  // table:
  // [
  //   ['name', 'price'],
  //   ['Cucumber', '2'],
  //   ['Tomato', '3'],
  // ]
});
```

## `rows()`

**Signature:** `rows(): string[][]`

Returns all rows except the first row. This is useful when the first row contains column headings but you want positional arrays instead of objects.

```gherkin
When I read the following product rows
  | name     | price |
  | Cucumber | 2     |
  | Tomato   | 3     |
```

```ts
When('I read the following product rows', async ({}, dataTable: DataTable) => {
  const products = dataTable.rows();

  // products:
  // [
  //   ['Cucumber', '2'],
  //   ['Tomato', '3'],
  // ]
});
```

## `rowsHash()`

**Signature:** `rowsHash(): Record<string, string>`

Converts a two-column table into an object. The first column supplies the property names and the second column supplies the values.

```gherkin
When I log in with the following details
  | username | vitalets |
  | password | 12345    |
```

```ts
When('I log in with the following details', async ({}, dataTable: DataTable) => {
  const credentials = dataTable.rowsHash();

  // credentials:
  // {
  //   username: 'vitalets',
  //   password: '12345',
  // }
});
```

Every row must contain exactly two cells. Otherwise, `rowsHash()` throws an error.

## `transpose()`

**Signature:** `transpose(): DataTable`

Returns a new `DataTable` with its rows and columns exchanged. You can call any `DataTable` method on the result.

```gherkin
When I transpose the following table
  | name     | Cucumber | Tomato |
  | price    | 2        | 3      |
```

```ts
When('I transpose the following table', async ({}, dataTable: DataTable) => {
  const transposed = dataTable.transpose().raw();

  // transposed:
  // [
  //   ['name', 'price'],
  //   ['Cucumber', '2'],
  //   ['Tomato', '3'],
  // ]
});
```
