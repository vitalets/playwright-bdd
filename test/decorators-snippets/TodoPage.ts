import { Locator, Page } from '@playwright/test';
import { createBddDecorators } from '../../dist';
import { test } from './fixtures';

const { Given } = createBddDecorators<typeof test>('todoPage');

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
}
