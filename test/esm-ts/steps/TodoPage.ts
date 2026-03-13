import { Fixture, Given } from 'playwright-bdd/decorators';
import type { test } from './fixtures2.js';

// prettier-ignore
export @Fixture<typeof test>('todoPage') class TodoPage {
  @Given('TodoPage: step')
  async step() {}
}
