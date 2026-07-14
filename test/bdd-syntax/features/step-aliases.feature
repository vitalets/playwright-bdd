@aliases
Feature: Step aliases

  Scenario: Use several titles for the same step function
    Given first alias without args
    And second alias without args
    When overlapping alias value 42
    Then first tagged alias
    And second tagged alias
