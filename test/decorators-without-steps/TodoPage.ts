import { expect } from '@playwright/test';
import { createBddDecorators } from '../../dist';
import { test } from './fixtures';

const { Given, When, Then, Step } = createBddDecorators<typeof test>('todoPage');

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

  @Then('visible todos count is {int}')
  async checkVisibleTodosCount(count: number) {
    expect(this.todos).toHaveLength(count);
  }

  @Step('has todos count {int}')
  async hasTodosCount(count: number) {
    expect(this.todos).toHaveLength(count);
  }
}
