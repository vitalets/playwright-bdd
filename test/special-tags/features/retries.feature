@retries:3
Feature: retries tag

  @retries:2
  Scenario: scenario 1
    Given success step 1

  @retries:1
  Scenario Outline: scenario 2
    Given success step <start>

    Examples:
      | start |
      | 2     |
      | 3     |
