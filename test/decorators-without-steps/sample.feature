Feature: decorators

    Scenario: guess fixture name by steps
      Given I am on todo page
      When I add todo "foo"
      And I add todo "bar"
      Then visible todos count is 2
      And used fixture is "TodoPage"

    # Scenario: guess fixture name by tag
    #   Then used fixture is "TodoPage"