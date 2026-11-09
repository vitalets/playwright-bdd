Feature: Configured decorators

  @cart
  Scenario: Cart decorators match cart scenarios
    Given the step is handled by fixture cartPage

  @checkout
  Scenario: Checkout decorators match checkout scenarios
    Given the step is handled by fixture checkoutPage

  @cart
  Scenario: BDD expression defaults and per-step overrides
    When configured legacy :name 4
    Then configured color blue
    And configured optional
    Given factory defaults :name 5
    And factory opt-in 6
