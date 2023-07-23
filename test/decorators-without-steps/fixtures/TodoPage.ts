import { expect } from '@playwright/test';
import { Fixture, Given, When, Then } from '../../../dist/decorators';
import { test } from '.';
import { BasePage, IntermediateBasePage } from './BasePage';

export
@Fixture<typeof test>('todoPage')
class TodoPage extends IntermediateBasePage {
  @Given('TodoPage: step')
  async step() {}

  @Then('TodoPage: used fixture is {string}')
  checkUsedFixture(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}

export
@Fixture<typeof test>('todoPageOnlyFixture')
class TodoPageOnlyFixture extends TodoPage {}

class IntermediateTodoPage extends TodoPageOnlyFixture {}

export
@Fixture<typeof test>('adminTodoPage')
class AdminTodoPage extends IntermediateTodoPage {
  @When('AdminTodoPage: step')
  async step() {}
}

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
