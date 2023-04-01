import { expect } from '@playwright/test';
import { setWorldConstructor, Then } from '@cucumber/cucumber';
import { World } from '../../src';

export class CustomWorld extends World {
  myBrowserName: string;
  constructor(...args: ConstructorParameters<typeof World>) {
    super(...args);
    this.myBrowserName = args[0].browserName;
  }
}

setWorldConstructor(CustomWorld);

Then(
  'Custom World contains fixtures and testInfo',
  async function (this: CustomWorld) {
    expect(this.page).toBeDefined();
    expect(this.context).toBeDefined();
    expect(this.browser).toBeDefined();
    expect(this.browserName).toEqual('chromium');
    expect(this.request).toBeDefined();
    expect(this.testInfo).toBeDefined();
    // custom prop
    expect(this.myBrowserName).toEqual('chromium');
  }
);
