import { setWorldConstructor, Then } from '@cucumber/cucumber';
import { World } from '../../src';

export type WorldParameters = {
  foo: string;
};

export class CustomWorld extends World<WorldParameters> {
  myBrowserName: string;
  constructor(...args: ConstructorParameters<typeof World<WorldParameters>>) {
    super(...args);
    this.myBrowserName = args[0].browserName;
  }
}

setWorldConstructor(CustomWorld);

Then(
  'Get world and args {string} and {int}',
  async function (this: CustomWorld, arg1: string, arg2: number) {
    return { world: this, arg1, arg2 };
  }
);
