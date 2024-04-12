import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('duplicate decorator step')
  async step1() {}

  @Given('duplicate decorator step')
  async step2() {}

  @Given(/duplicate decorator step/)
  async step3() {}
}
