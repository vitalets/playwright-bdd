import { Given, When, Then, Fixture } from 'playwright-bdd/decorators';
import { test } from './fixtures';

/**
 * Test basic multiple decorators with same keyword
 */
export
@Fixture<typeof test>('basicPage')
class BasicPage {
  constructor(private log: string[]) {}

  @When('a item {string} exists')
  @When('a item called {string} is added')
  async addItem(itemName: string) {
    this.log.push(`addItem: ${itemName}`);
  }

  @Then('result is {int}')
  @Then('I see result {int}')
  async checkResult(value: number) {
    this.log.push(`checkResult: ${value}`);
  }
}

/**
 * Test multiple decorators with different keywords
 */
export
@Fixture<typeof test>('mixedPage')
class MixedPage {
  constructor(private log: string[]) {}

  @Given('I have item {string}')
  @When('I add item {string}')
  async setupItem(itemName: string) {
    this.log.push(`setupItem: ${itemName}`);
  }
}

/**
 * Test multiple decorators with tags
 */
export
@Fixture<typeof test>('taggedPage')
class TaggedPage {
  constructor(private log: string[]) {}

  @Given('step one', { tags: '@foo' })
  @Given('step two', { tags: '@bar' })
  async taggedStep() {
    this.log.push('taggedStep');
  }
}

/**
 * Test inheritance with multiple decorators
 */
export
@Fixture<typeof test>('basePage')
class BasePage {
  constructor(protected log: string[]) {}

  @Given('base step 1')
  @Given('base step 2')
  async baseStep() {
    this.log.push('baseStep');
  }
}

export
@Fixture<typeof test>('childPage')
class ChildPage extends BasePage {
  @When('child step 1')
  @When('child step 2')
  async childStep() {
    this.log.push('childStep');
  }
}

/**
 * Test with RegExp patterns
 */
export
@Fixture<typeof test>('regexpPage')
class RegexpPage {
  constructor(private log: string[]) {}

  @When(/^a item (?:called )?"([^"]+)"$/)
  @When('a item named {string}')
  async addItemRegexp(name: string) {
    this.log.push(`addItemRegexp: ${name}`);
  }
}

/**
 * Test single decorator still works
 */
export
@Fixture<typeof test>('singlePage')
class SinglePage {
  constructor(private log: string[]) {}

  @Given('single step')
  async singleStep() {
    this.log.push('singleStep');
  }
}
