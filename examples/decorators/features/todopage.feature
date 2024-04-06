Feature: Todo Page

  Background:
    Given I am on todo page

  Scenario: Empty list
    Then visible todos count is 0

  Scenario: Add todos
    When I add todo "foo"
    And I add todo "bar"
    Then visible todos count is 2

  Scenario: Complete todos
    When I add todo "foo"
    And I add todo "bar"
    And I complete todo "bar"
    And I filter todos as "Completed"
    Then visible todos count is 1

  Scenario: Remove todos
    When I add todo "foo"
    And I add todo "bar"
    And I remove todo "bar"
    Then visible todos count is 1
