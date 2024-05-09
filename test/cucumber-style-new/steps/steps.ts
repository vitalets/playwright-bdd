import { expect } from '@playwright/test';
import { Before, After, Given, When, Then } from './fixtures';

Before(function () {
  expect(this.foo).toEqual(42);
});

After(function () {
  expect(this.foo).toEqual(42);
});

Given('step with string {string}', function (_s: string) {
  expect(this.foo).toEqual(42);
});

When('step with number {int}', async function (_n: number) {
  expect(this.foo).toEqual(42);
});

Then('step without params', async function () {
  expect(this.foo).toEqual(42);
});
