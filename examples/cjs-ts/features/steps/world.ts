import { setWorldConstructor } from '@cucumber/cucumber';
import { World } from 'playwright-bdd';

export class CustomWorld extends World {
  myBrowserName: string;
  constructor(...args: ConstructorParameters<typeof World>) {
    super(...args);
    this.myBrowserName = args[0].browserName;
  }
}

setWorldConstructor(CustomWorld);
