@timeout:5000
Feature: timeout-feature

  Scenario: scenario 1
    Then delay 1050

  Scenario Outline: scenario 2
    Then delay <delay>

    Examples:
      | delay |
      | 1050  |
