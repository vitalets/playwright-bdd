Feature: custom parameter type in decorator steps

  Scenario: Custom union parameter in a Cucumber expression
    Given step with custom param red

  Scenario: Custom union parameter and built-in parameter in a BDD expression
    Given BDD custom color blue with count 2

  Scenario: Optional custom parameter preserves its value or undefined
    Given BDD optional color yellow
    And BDD optional color
