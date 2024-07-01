import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures1';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('step 1')
  async step() {}
}
