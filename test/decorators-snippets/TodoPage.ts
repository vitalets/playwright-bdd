import { Fixture, Given } from '../../dist/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  todos: string[] = [];

  @Given('I am on todo page')
  async init() {
    this.todos = [];
  }
}
