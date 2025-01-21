Feature: timeout-in-step

  Scenario: timeout in step
    Given step with page
    Given timeouted step
    When Action 1
