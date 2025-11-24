import { Given, Fixture } from 'playwright-bdd/decorators';

export
@Fixture('todoPage')
class TodoPage {
  @Given('TodoPage: step')
  step() {}
}
