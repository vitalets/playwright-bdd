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

Then(
  'Переданный аргумент {string} содержит {int} букв(ы)',
  async function ({}, arg: string, letters: number) {
    expect(arg).toHaveLength(letters);
  },
);
