Feature: rule

  Background:
    Given Set context prop "foo" = "bar"

  Rule: Rule 1

    Background:
      Given Set context prop "xxx" = "1"

    Scenario: Scenario 1
      When Action 2
      Then Context prop "foo" to equal "bar"
      And Context prop "xxx" to equal "1"

    Scenario: Scenario 2
      Then Context prop "foo" to equal "bar"
      Then Context prop "xxx" to equal "1"

  Rule: Rule 2

    Background:
      Given Set context prop "yyy" = "1"

    Scenario: Scenario 3
      Then Context prop "foo" to equal "bar"
      Then Context prop "yyy" to equal "1"
      Then Context prop "xxx" to equal "undefined"
