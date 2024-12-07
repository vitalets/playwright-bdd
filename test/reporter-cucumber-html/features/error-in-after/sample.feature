Feature: error-in-after

  Scenario: error in fixture teardown (no step)
    Given step with page
    Given step that uses fixtureWithErrorInTeardown
    When Action 1

  Scenario: error in fixture teardown (with step)
    Given step with page
    Given step that uses fixtureWithErrorInTeardownStep
    When Action 1

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
