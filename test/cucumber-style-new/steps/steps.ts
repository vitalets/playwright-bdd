import { expect } from '@playwright/test';
import { Before, Given } from './fixtures';

Before(function () {
  // this.foo;
  // todo: typings work, now we need actually pass world instance
  // expect(this.foo).toEqual(42);
});

Given('step', function () {
   expect(this.foo).toEqual(42);
});
