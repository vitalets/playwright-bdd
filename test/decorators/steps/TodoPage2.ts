import { expect } from '@playwright/test';
import { Fixture, Given, When, Then } from '../../../dist/decorators';
import { test } from './fixtures';
import { BasePage } from './BasePage';

export
@Fixture<typeof test>('todoPage2')
class TodoPage2 extends BasePage {
  @Given('TodoPage2: step')
  async step() {}

  @Then('TodoPage2: used fixture is {string}')
  checkUsedFixture(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}

export
@Fixture<typeof test>('adminTodoPage2')
class AdminTodoPage2 extends TodoPage2 {
  @When('AdminTodoPage2: step')
  async step() {}
}
