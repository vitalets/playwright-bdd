import { expect } from '@playwright/test';
import { Then } from 'playwright-bdd/decorators';

export class BasePage {
  @Then('BasePage: used fixture is {string}')
  checkUsedFixture(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}

export class IntermediateBasePage extends BasePage {
  @Then('IntermediateBasePage: used fixture is {string}')
  checkUsedFixture(name: string) {
    expect(this.constructor.name).toEqual(name);
  }
}
