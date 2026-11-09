import { createBddDecorators, type BddTestFixtures } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Fixture, Given, When, Then, Step } = createBddDecorators({
  tags: '@cart',
  bddExpr: true,
});
const checkout = createBddDecorators({ tags: '@checkout' });
const defaults = createBddDecorators();

export
@Fixture('cartPage')
class CartPage {
  constructor(private $step: BddTestFixtures['$step']) {}

  @Given('the step is handled by fixture {word}')
  checkFixture(expectedFixture: string) {
    expect(expectedFixture).toBe('cartPage');
  }

  @When('configured legacy :name {int}', { bddExpr: false })
  legacy(count: number) {
    expect(count).toBe(4);
    expect(this.$step.params).toEqual({});
  }

  @Then('configured color {red/blue}')
  color(color: 'red' | 'blue') {
    expect(color).toBe('blue');
  }

  @Step('configured optional( :count{int})')
  optional(count?: number) {
    expect(count).toBeUndefined();
  }

  @defaults.Given('factory defaults :name {int}')
  defaultSyntax(count: number) {
    expect(count).toBe(5);
    expect(this.$step.params).toEqual({});
  }

  @defaults.Given('factory opt-in :count{int}', { bddExpr: true })
  explicitOptIn(count: number) {
    expect(count).toBe(6);
    expect(this.$step.params).toEqual({ count: 6 });
  }
}

export
@checkout.Fixture('checkoutPage')
class CheckoutPage {
  @checkout.Given('the step is handled by fixture {word}')
  checkFixture(expectedFixture: string) {
    expect(expectedFixture).toBe('checkoutPage');
  }
}
