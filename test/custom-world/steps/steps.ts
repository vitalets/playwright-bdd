import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from './world';

Then('check custom world', function (this: CustomWorld) {
  expect(this.page).toBeDefined();
  expect(this.context).toBeDefined();
  expect(this.browser).toBeDefined();
  expect(this.browserName).toEqual('chromium');
  expect(this.request).toBeDefined();
  expect(this.testInfo).toBeDefined();
  expect(this.testInfo.title).toEqual('Check custom world');
  expect(this.test).toBeDefined();
  expect(this.tags).toEqual(['@mytag']);
  expect(this.propFromConstructor).toEqual('valueFromConstructor');
  expect(this.propFromInit).toEqual('valueFromInit');
  expect(this.parameters).toEqual({ myParam: 'myValue' });
});
