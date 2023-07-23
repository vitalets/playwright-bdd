import { Fixture, Given } from 'playwright-bdd/decorators.js';
import { test } from './fixtures.js';
import { TodoPage } from '../TodoPage.js';

export
@Fixture<typeof test>('adminTodoPage')
class AdminTodoPage extends TodoPage {
  @Given('AdminTodoPage: step')
  async step() {}
}
