import { setWorldConstructor, Then } from '@cucumber/cucumber';
import { World, WorldOptions } from '../../src';

export type WorldParameters = {
  foo: string;
};

export class CustomWorld extends World<WorldParameters> {
  myBrowserName: string;
  propFromInit = '';
  constructor(options: WorldOptions<WorldParameters>) {
    super(options);
    this.myBrowserName = options.browserName;
  }

  async init() {
    this.propFromInit = 'valueFromInit';
  }
}

setWorldConstructor(CustomWorld);

Then('Get world', function (this: CustomWorld) {
  return this;
});
