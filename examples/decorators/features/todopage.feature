Feature: Todo Page

    Scenario: Adding todos
      Given I am on todo page
      When I add todo "foo"
      And I add todo "bar"
      Then visible todos count is 2

    Scenario: Removing todos as admin
      Given I am on todo page
      When I add todo "foo"
      And I add todo "bar"
      And I remove todo "foo"
      Then visible todos count is 1