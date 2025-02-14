Feature: error

  @error-in-before-step-hook
  Scenario: scenario 1
    Given step 1
    Then step 2

  @error-in-after-step-hook
  Scenario: scenario 2
    Given step 3
    Then step 4
