Feature: report location

  Background:
    Given background step
    And Action 00

  Scenario: Scenario 1
    Given I am on home page
    And decorator step
    And Action 1
    When Action 2
    And Action 3
    Then Action 4
    But Action 5
    * Action 6

  Scenario Outline: Scenario 2
    Given Action <num>

    Examples:
      | num |
      | 44  |

    Examples:
      | num |
      | 55  |
