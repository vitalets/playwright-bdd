Feature: background

    Background:
        Given Set world prop "foo" = "bar"

    Scenario: Scenario 1
        Then World prop "foo" to equal "bar"

    Scenario: Scenario 2
        Then World prop "foo" to equal "bar"