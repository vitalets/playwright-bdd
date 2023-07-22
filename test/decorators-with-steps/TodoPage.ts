import { Fixture, Given, When } from '../../dist/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  todos: string[] = [];

  @Given('I am on todo page')
  async init() {
    this.todos = [];
  }

  @When('I add todo {string}')
  async addToDo(text: string) {
    this.todos.push(text);
  }
}
