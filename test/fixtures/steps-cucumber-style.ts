import { expect } from '@playwright/test';
import { When, Then } from '@cucumber/cucumber';
import { BddWorld } from '../../dist';
import { test } from './fixtures';

type MyWorld = BddWorld<object, typeof test>;

When<MyWorld>('testScopedFixture set prop to {string}', async function (value: string) {
  const testScopedFixture = this.useFixture('testScopedFixture');
  testScopedFixture.prop = value;
});

Then<MyWorld>('testScopedFixture prop equals to {string}', async function (value: string) {
  const testScopedFixture = this.useFixture('testScopedFixture');
  expect(testScopedFixture.prop).toEqual(value);
});

When<MyWorld>('workerScopedFixture set prop to {string}', async function (value: string) {
  const workerScopedFixture = this.useFixture('workerScopedFixture');
  workerScopedFixture.prop = value;
});

Then<MyWorld>('workerScopedFixture prop equals to {string}', async function (value: string) {
  const workerScopedFixture = this.useFixture('workerScopedFixture');
  expect(workerScopedFixture.prop).toEqual(value);
});
