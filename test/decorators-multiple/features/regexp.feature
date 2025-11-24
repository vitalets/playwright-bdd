Feature: Multiple decorators with RegExp

  Scenario: Using RegExp pattern
    When a item "apple"
    Then log is "addItemRegexp: apple"

  Scenario: Using Cucumber expression
    When a item named "banana"
    Then log is "addItemRegexp: banana"

  Scenario: Using RegExp with called keyword
    When a item called "orange"
    Then log is "addItemRegexp: orange"
