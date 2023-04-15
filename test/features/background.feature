Feature: background

    Background:
        Given Set world param "foo" = "bar"

    Scenario: Scenario 1
        Then World param "foo" to equal "bar"

    Scenario: Scenario 2
        Then World param "foo" to equal "bar"