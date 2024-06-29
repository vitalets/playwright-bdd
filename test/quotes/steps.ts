import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';

const { Given } = createBdd();

Given('step with quotes in title \'`"', () => {
  // noop
});

Given('step with quotes in params {string} and {string}', ({}, param1: string, param2: string) => {
  expect(param1).toEqual('value with \'`" quotes');
  expect(param2).toEqual('value with \'`" quotes');
});

Given('step with newline in param {string}', ({}, param: string) => {
  expect(param).toEqual('value with\n newline');
});

Given('step with docString', ({}, docString: string) => {
  expect(docString).toEqual('value with \'`" quotes\nand newline');
});

Given('step with dataTable', ({}, table: DataTable) => {
  const { value1, value2 } = table.hashes()[0];
  expect(value1).toEqual('value with \'`" quotes');
  expect(value2).toEqual('value with\n newline');
});
