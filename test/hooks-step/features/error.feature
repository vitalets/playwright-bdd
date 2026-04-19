Feature: error

  @error-in-before-step-hook
  Scenario: scenario 1
    Given step 1
    Then step 2

  @error-in-after-step-hook
  Scenario: scenario 2
    Given step 3
    Then step 4

  Scenario: scenario 3 error in step
    Given step with error

  Scenario: scenario 4 skip in step
    Given step with skip
    Then step 5

  @timeout:500
  Scenario: scenario 5 timeout in step
    Given step with timeout
    Then step 6
