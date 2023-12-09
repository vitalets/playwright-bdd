import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('unique step')
  async step1() {}

  @Given('duplicate step')
  async step2() {}

  @Given('duplicate step')
  async step3() {}
}
