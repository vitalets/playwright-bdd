@slow
Feature: timeout tag

  Scenario: scenario 1
    Given success step 1

  @slow
  Scenario Outline: scenario 2
    Given success step <start>

    Examples:
      | start |
      | 2     |
      | 3     |
