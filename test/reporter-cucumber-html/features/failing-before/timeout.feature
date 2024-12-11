Feature: timeout-in-before

  @before-hook-with-timeout
  Scenario: timeout in before hook
    Given Action 1

  Scenario: timeout in fixture setup
    Given Action 0
    Given step that uses fixtureWithTimeoutInSetup
    When Action 1
