@mode:parallel
Feature: mode tag

  Scenario: scenario 1
    Given success step 1

  @mode:default
  Scenario Outline: scenario 2
    Given success step <start>

    Examples:
      | start | end |
      | 2     | 4   |
      | 3     | 6   |
