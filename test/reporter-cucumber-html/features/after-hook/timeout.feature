Feature: timeout-in-after

  @after-hook-with-timeout
  Scenario: timeout in after hook
    Given step with page

  # see: https://github.com/microsoft/playwright/issues/30175
  Scenario: timeout in fixture teardown
    Given Action 0
    Given step that uses fixtureWithTimeoutInTeardown
    When Action 1

  Scenario: timeout in step and in fixture teardown
    Given Action 0
    Given timeouted step
    When Action 1
    Given step that uses fixtureWithTimeoutInTeardown
