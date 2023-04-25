import { setWorldConstructor } from '@cucumber/cucumber';
import { World } from 'playwright-bdd';

export class CustomWorld extends World {
  foo = 'bar';
}

setWorldConstructor(CustomWorld);
