Feature: default world

    Background:
        Given Set world prop "foo" = "bar"

    Scenario: Check built-in props
        Then World prop "page" to be defined
        And World prop "context" to be defined
        And World prop "browser" to be defined
        And World prop "browserName" to equal "chromium"
        And World prop "request" to be defined
        And World prop "testInfo" to be defined
        And World prop "test" to be defined
        And World prop "tags" to be defined

    Scenario: Check user defined props
        Then World parameter "myParam" to equal "myValue"
        And World prop "foo" to equal "bar"
      