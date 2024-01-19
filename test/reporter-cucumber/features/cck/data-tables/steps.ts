import assert from 'node:assert/strict';
import { DataTable } from '@cucumber/cucumber';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();
type World = { transposed: DataTable };

When('the following table is transposed:', function (this: World, {}, table: DataTable) {
  this.transposed = table.transpose();
});

Then('it should be:', function (this: World, {}, expected: DataTable) {
  assert.deepEqual(this.transposed, expected);
});
