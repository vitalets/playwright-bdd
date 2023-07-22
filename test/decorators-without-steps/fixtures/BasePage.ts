import { expect } from '@playwright/test';
import { Given, Then } from '../../../dist/decorators';

export class BasePage {
  todos: string[] = [];

  @Given('I am on todo page')
  async init() {
    this.todos = [];
  }

  @Then('used fixture is {string}')
  checkUsedFixtureName(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}
