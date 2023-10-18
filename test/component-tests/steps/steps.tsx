import React from 'react-dom';
import { expect } from '@playwright/test';
import { createBdd } from '../../../dist';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('Mounted input component', async ({mount}) => {
  await mount(
    <input type="text" data-testid="textField" />
  );
});

When('I type {string}', async ({page}, arg:string) => {
  await page.getByTestId('textField').fill(arg)
});

Then('input field has {string}', async ({page}, arg: string) => {
  await expect(page.getByTestId('textField')).toHaveValue(arg);
});
