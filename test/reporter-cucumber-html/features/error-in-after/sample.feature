Feature: error-in-after

  Scenario: Failing by failingAfterFixtureNoStep
    Given step that uses failingAfterFixtureNoStep
    When Action 3

  Scenario: Failing by failingAfterFixtureWithStep
    Given step that uses failingAfterFixtureWithStep
    When Action 4

  # see: https://github.com/microsoft/playwright/issues/30175
  Scenario: timeout in after fixture
    Given Action 0
    Given step that uses timeouted after fixture
    When Action 1

  Scenario: timeout in step and in after fixture
    Given Action 0
    Given timeouted step
    When Action 1
    Given step that uses timeouted after fixture
