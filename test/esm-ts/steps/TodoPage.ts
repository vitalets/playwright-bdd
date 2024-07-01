import { Fixture, Given } from 'playwright-bdd/decorators';
import type { test } from './fixtures2.js';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('TodoPage: step')
  async step() {}
}
