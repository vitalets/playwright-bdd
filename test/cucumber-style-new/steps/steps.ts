// import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Before } = createBdd(test, { worldFixture: 'world' });

Before(function () {
  this.foo;
  // todo: typings work, now we need actually pass world instance
  // expect(this.foo).toEqual(42);
});

Given('step', function () {
  // expect(this.someFixture).toEqual('foo');
});
