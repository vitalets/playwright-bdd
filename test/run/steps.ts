import { expect } from '@playwright/test';
import { Then } from '@cucumber/cucumber';
import { World } from '../../src';

Then(
  'Default World contains fixtures and testInfo',
  async function (this: World) {
    expect(this.page).toBeDefined();
    expect(this.context).toBeDefined();
    expect(this.browser).toBeDefined();
    expect(this.browserName).toEqual('chromium');
    expect(this.request).toBeDefined();
    expect(this.testInfo).toBeDefined();
  }
);
