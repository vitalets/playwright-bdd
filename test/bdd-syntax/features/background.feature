Feature: background

  Background:
    Given Set context prop "foo" = "bar"

  Scenario: Scenario 1
    Then Context prop "foo" to equal "bar"

  Scenario: Scenario 2
    Then Context prop "foo" to equal "bar"
