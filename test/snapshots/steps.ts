import { expect } from '@playwright/test';
import { createBdd } from '../../dist';

const { Then } = createBdd();

Then('snapshot contains text {string}', async ({}, text: string) => {
  expect(text).toMatchSnapshot('title.txt');
});
