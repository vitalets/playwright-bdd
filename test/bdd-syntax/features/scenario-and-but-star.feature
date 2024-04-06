Feature: scenario-and-but-star

  Scenario: Scenario with and/but
    Given State 1
    And State 2
    When Action 4
    And Action 5
    Then Check 1
    And Check 7

  Scenario: Scenario with star
    Given State 1
    * State 2
    When Action 4
    * Action 5
    Then Check 1
    * Check 7
