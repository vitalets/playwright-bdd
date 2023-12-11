import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('Состояние {int}', async function () {
  // noop
});

When('Действие {int}', async function () {
  // noop
});

Then('Результат {int}', async function () {
  // noop
});

Then('Переданный аргумент {string} равен "куку"', async function ({}, arg: string) {
  expect(arg).toEqual('куку');
});
