Feature: error-in-after

  @failing-anonymous-after-hook
  Scenario: error in anonymous after hook
    Given step with page

  @failing-named-after-hook
  Scenario: error in named after hook
    Given step with page

  @after-hook-with-timeout
  Scenario: timeout in after hook
    Given step with page

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
