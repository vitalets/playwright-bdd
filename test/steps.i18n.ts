import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../src';

Given('Состояние {int}', async function () {
  // noop
});

When('Действие {int}', async function () {
  // noop
});

Then('Результат {int}', async function () {
  // noop
});

Then('Переданный аргумент {string} равен "куку"', async function (this: World, arg: string) {
  expect(arg).toEqual('куку');
});
