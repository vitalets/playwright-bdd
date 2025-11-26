Feature: Multiple decorators with different keywords

  Scenario: Using Given variant
    Given I have item "apple"
    Then log is "setupItem: apple"

  Scenario: Using When variant
    When I add item "banana"
    Then log is "setupItem: banana"
