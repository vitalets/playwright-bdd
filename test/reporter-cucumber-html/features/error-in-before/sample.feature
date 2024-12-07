Feature: error-in-before

  @failing-anonymous-hook
  Scenario: Failing by anonymous before hook
    Given Action 1

  @failing-named-hook
  Scenario: Failing by named before hook
    Given Action 1

  Scenario: Failing by fixture setup (no step)
    Given step that uses fixtureWithErrorInSetup
    When Action 1

  Scenario: Failing by fixture setup (with step)
    Given step that uses fixtureWithErrorInSetupStep
    When Action 2

  Scenario: Failing by fixture setup timeout
    Given Action 0
    Given step that uses fixtureWithTimeoutInSetup
    When Action 1
