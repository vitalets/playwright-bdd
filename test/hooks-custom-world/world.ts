import { setWorldConstructor } from '@cucumber/cucumber';
import { BddWorld } from '../../dist';

export class CustomWorld extends BddWorld {
  foo = 'bar';
}

setWorldConstructor(CustomWorld);
