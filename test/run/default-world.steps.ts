import { DataTable, Then } from '@cucumber/cucumber';
import { World } from '../../src';

Then(
  'Get world and args {string} and {int}',
  async function (this: World, arg1: string, arg2: number) {
    return { world: this, arg1, arg2 };
  }
);

Then('Get doc string', async function (this: World, text: string) {
  return text;
});

Then('Get data table', async function (this: World, table: DataTable) {
  return table;
});
