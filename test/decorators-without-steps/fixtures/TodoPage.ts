import { expect } from '@playwright/test';
import { Fixture, When, Then, Step } from '../../../dist/decorators';
import { test } from '.';
import { BasePage } from './BasePage';

export
@Fixture<typeof test>('todoPage')
class TodoPage extends BasePage {
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
