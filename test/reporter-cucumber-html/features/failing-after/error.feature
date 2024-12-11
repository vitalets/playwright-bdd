Feature: error-in-after

  @failing-anonymous-after-hook
  Scenario: error in anonymous after hook
    Given step with page

  @failing-named-after-hook
  Scenario: error in named after hook
    Given step with page

  Scenario: error in fixture teardown (no step)
    Given step with page
    Given step that uses fixtureWithErrorInTeardown
    When Action 1

  Scenario: error in fixture teardown (with step)
    Given step with page
    Given step that uses fixtureWithErrorInTeardownStep
    When Action 1
