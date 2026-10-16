import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';

Given('a step with a doc string', ({ $step }, content: string) => {
  expect($step.title).toBe('a step with a doc string');
  expect($step.docStringType).toBe('application/json');
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
  expect($step.error).toBeUndefined();
  expect($step.info).toBeDefined();
  $step.skip(false);
});
