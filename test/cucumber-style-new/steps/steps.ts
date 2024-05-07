import { expect } from '@playwright/test';
import { Before, After, Given, When, Then } from './fixtures';

Before(function () {
  expect(this.foo).toEqual(42);
});

After(function () {
  expect(this.foo).toEqual(42);
});

Given('step 1', function () {
  expect(this.foo).toEqual(42);
});

When('step 2', function () {
  expect(this.foo).toEqual(42);
});

Then('step 3', function () {
  expect(this.foo).toEqual(42);
});
