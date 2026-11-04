import { expect } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { Given, Then } from './fixtures';

Given('a step with a doc string', ({ $step }, content: string) => {
  expect($step.title).toBe('a step with a doc string');
  expect($step.docStringType).toBe('application/json');
  expect($step.docString).toBe(content);
  expect($step.dataTable).toBeUndefined();
  // Verify the doc string content is passed alongside its media type in $step.
  expect(JSON.parse(content)).toEqual({ value: 42 });
  expect($step.info).toBeDefined();
});

Given('a skipped step', ({ $step }) => {
  $step.skip(true, 'skip this step only');
  throw new Error('body continued after skip');
});

Then('a step without a doc string', ({ $step }) => {
  expect($step.title).toBe('a step without a doc string');
  expect($step.docStringType).toBeUndefined();
  expect($step.docString).toBeUndefined();
  expect($step.dataTable).toBeUndefined();
  expect($step.error).toBeUndefined();
  expect($step.info).toBeDefined();
  $step.skip(false);
});

Given('a step with a data table', ({ $step }, table: DataTable) => {
  expect($step.dataTable).toBe(table);
  expect(table.hashes()).toEqual([{ value: '42' }]);
});

Given('an empty doc string', ({ $step }, content: string) => {
  expect(content).toBe('');
  expect($step.docString).toBe('');
});
