Feature: error-in-before

  @failing-anonymous-before-hook
  Scenario: error in anonymous before hook
    Given Action 1

  @failing-named-before-hook
  Scenario: error in named before hook
    Given Action 1

  @before-hook-with-timeout
  Scenario: timeout in before hook
    Given Action 1

  Scenario: error in fixture setup (no step)
    Given step that uses fixtureWithErrorInSetup
    When Action 1

  Scenario: error in fixture setup (with step)
    Given step that uses fixtureWithErrorInSetupStep
    When Action 2

  Scenario: timeout in fixture setup
    Given Action 0
    Given step that uses fixtureWithTimeoutInSetup
    When Action 1
