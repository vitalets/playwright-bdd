import { expect } from '@playwright/test';
import { Given, Then } from '@cucumber/cucumber';
import { BddWorld } from '../../dist';

Given(
  'Set world prop {string} = {string}',
  async function (this: BddWorld & Record<string, string>, key: string, value: string) {
    this[key] = value;
  },
);

Then(
  'World prop {string} to equal {string}',
  async function (this: BddWorld & Record<string, string>, key: string, value: string) {
    expect(String(this[key])).toEqual(value);
  },
);

Then(
  'World parameter {string} to equal {string}',
  async function (this: BddWorld, key: string, value: string) {
    expect(String(this.parameters[key])).toEqual(value);
  },
);

Then('World prop {string} to be defined', async function (this: BddWorld, key: keyof BddWorld) {
  expect(this[key]).toBeDefined();
});
