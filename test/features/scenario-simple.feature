Feature: scenario-simple

    Scenario: Scenario one
        Given State 1
        When Action 1
        Then Passed int arg 42 to equal 42
        Then Passed string arg "foo" to equal "foo"

    Scenario: Check world props
        Then World prop "page" to be defined
        And World prop "context" to be defined
        And World prop "browser" to be defined
        And World prop "browserName" to be defined
        And World prop "request" to be defined
        And World prop "testInfo" to be defined