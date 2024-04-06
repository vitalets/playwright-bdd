Feature: decorators-snippets

  Scenario: todo page
    Given I am on todo page
    When I add todo "foo"
    And I add todo "bar"
    Then visible todos count is 2
