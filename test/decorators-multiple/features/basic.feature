Feature: Basic multiple decorators

  Scenario: Using first pattern variant
    When a item "apple" exists
    Then log contains "addItem: apple"

  Scenario: Using second pattern variant
    When a item called "banana" is added
    Then log contains "addItem: banana"

  Scenario: Using both Then variants
    Then result is 42
    And I see result 100
    Then log contains "checkResult: 42,checkResult: 100"
