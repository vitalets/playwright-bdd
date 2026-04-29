import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('Состояние {int}', async function ({}, _state: number) {
  // noop
});

When('Действие {int}', async function ({}, _action: number) {
  // noop
});

Then('Результат {int}', async function ({}, _result: number) {
  // noop
});

Then(
  'Переданный аргумент {string} содержит {int} букв(ы)',
  async function ({}, arg: string, letters: number) {
    expect(arg).toHaveLength(letters);
  },
);
