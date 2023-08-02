import { Locator, Page, expect } from '@playwright/test';
import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  readonly inputBox: Locator;
  readonly todoItems: Locator;

  constructor(public page: Page) {
    this.inputBox = this.page.locator('input.new-todo');
    this.todoItems = this.page.getByTestId('todo-item');
  }

  @Given('I am on todo page')
  async open() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  @When('I add todo {string}')
  async addTodo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press('Enter');
  }

  @When('I complete todo {string}')
  async completeTodo(hasText: string) {
    const checkbox = this.todoItems.filter({ hasText }).getByRole('checkbox');
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
  }

  @When(/I filter todos as "(All|Completed)"/)
  async filterTodos(name: 'All' | 'Completed') {
    await this.page.getByRole('link', { name }).click();
  }

  @Then('visible todos count is {int}')
  async checkVisibleTodosCount(count: number) {
    await expect(this.todoItems).toHaveCount(count);
  }
}
