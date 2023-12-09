import { setWorldConstructor } from '@cucumber/cucumber';
import { BddWorld, BddWorldOptions } from 'playwright-bdd';

export type WorldParameters = {
  foo: string;
};

export class CustomWorld extends BddWorld<WorldParameters> {
  propFromConstructor: string;
  propFromInit = '';
  constructor(options: BddWorldOptions<WorldParameters>) {
    super(options);
    this.propFromConstructor = 'valueFromConstructor';
  }

  async init() {
    this.propFromInit = 'valueFromInit';
  }
}

setWorldConstructor(CustomWorld);
