import { setWorldConstructor } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';

export class CustomWorld extends BddWorld {
  foo = 'bar';
}

setWorldConstructor(CustomWorld);
