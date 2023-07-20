import { createBddDecorators } from '../../dist';
import { test } from './fixtures';

const { Given, When } = createBddDecorators<typeof test>('todoPage');

export class TodoPage {
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
