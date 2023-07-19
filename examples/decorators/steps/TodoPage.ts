import { Locator, Page, expect } from '@playwright/test';
import { createBddDecorators } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then, Step } = createBddDecorators<typeof test>('todoPage');

export class TodoPage {
  readonly inputBox: Locator;
  readonly todoItems: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator('input.new-todo');
    this.todoItems = this.page.getByTestId('todo-item');
  }

  @Given('I am on todo page')
  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  @When('I add todo {string}')
  async addToDo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press('Enter');
  }

  @Then('visible todos count is {int}')
  async checkVisibleTodosCount(count: number) {
    await expect(this.todoItems).toHaveCount(count);
  }

  @Step('has todos count {int}')
  async hasTodosCount(count: number) {
    await expect(this.todoItems).toHaveCount(count);
  }
}
