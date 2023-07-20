import { createBddDecorators } from '../../dist';
import { test } from './fixtures';

const { Given } = createBddDecorators<typeof test>('todoPage');

export class TodoPage {
  todos: string[] = [];

  @Given('I am on todo page')
  async init() {
    this.todos = [];
  }
}
