// import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test, { worldFixture: 'world' });

Given('step', function () {
  // expect(this.someFixture).toEqual('foo');
});
