Feature: rule

  Background:
    Given Set world prop "foo" = "bar"

  Rule: Rule 1 

    Background:
      Given Set world prop "xxx" = "1"

    Scenario: Scenario 1
      When Action 2
      Then World prop "foo" to equal "bar"
      And World prop "xxx" to equal "1"

    Scenario: Scenario 2
      Then World prop "foo" to equal "bar"
      Then World prop "xxx" to equal "1"

  Rule: Rule 2

    Background:
      Given Set world prop "yyy" = "1"

    Scenario: Scenario 3
      Then World prop "foo" to equal "bar"
      Then World prop "yyy" to equal "1"
      Then World prop "xxx" to equal "undefined"
