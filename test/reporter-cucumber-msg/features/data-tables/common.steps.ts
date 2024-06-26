import assert from 'node:assert/strict';
import { DataTable } from 'playwright-bdd';
import { When, Then } from '../fixtures';

When('the following table is transposed:', function (table: DataTable) {
  this.transposed = table.transpose();
});

Then('it should be:', function (expected: DataTable) {
  assert.deepEqual(this.transposed, expected);
});
