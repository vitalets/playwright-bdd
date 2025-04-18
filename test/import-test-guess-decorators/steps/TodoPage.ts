import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('todoPage: step')
  async step() {}
}
