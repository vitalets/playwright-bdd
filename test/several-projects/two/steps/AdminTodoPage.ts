import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures.js';
import { TodoPage } from '../../one/steps/TodoPage.js';

export
@Fixture<typeof test>('adminTodoPage')
class AdminTodoPage extends TodoPage {
  @Given('AdminTodoPage: step')
  async step() {}
}
