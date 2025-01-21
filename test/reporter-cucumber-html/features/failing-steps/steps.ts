import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

Given('timeouted step', async ({ $testInfo }) => {
  await new Promise((r) => setTimeout(r, $testInfo.timeout + 100));
});

When('failing soft assertion {string}', async ({}, msg: string) => {
  expect.soft('xxx').toEqual(msg);
});

When('fails until retry {int}', async ({ $testInfo }, retry: number) => {
  if ($testInfo.retry < retry) {
    expect(1).toEqual(2);
  }
});

Then('error in match snapshot', async () => {
  expect('Example Domain').toMatchSnapshot();
});
