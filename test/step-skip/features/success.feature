Feature: Skip steps

  Scenario: Skip body
    Given the body skips
    Then the next step runs

  Scenario: Skip without arguments
    Given the body skips unconditionally
    Then the next step runs

  @skip-in-before-step-hook
  Scenario: Skip in unnamed before hook
    Given the body must not run
    Then the next step runs

  @skip-in-named-before-step-hook
  Scenario: Skip in named before hook
    Given the body must not run
    Then the next step runs
