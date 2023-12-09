import { expect } from '@playwright/test';
import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';
import { test } from './fixtures';

class BasePage {
  @Then('BasePage: used fixture is {string}')
  checkUsedFixture(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}

export
@Fixture<typeof test>('todoPage')
class TodoPage extends BasePage {
  @Given('TodoPage: step')
  async step() {}

  @Then('TodoPage: used fixture is {string}')
  checkUsedFixture(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}

export
@Fixture<typeof test>('adminTodoPage')
class AdminTodoPage extends TodoPage {
  @When('AdminTodoPage: step')
  async step() {}
}
