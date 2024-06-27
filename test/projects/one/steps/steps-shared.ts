import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
import { FOO } from '../../playwright.config';

const { Given } = createBdd(test);

Given('Shared step of project one', async ({ option }) => {
  expect(option).toEqual('foo');
  expect(option).toEqual(FOO);
});
