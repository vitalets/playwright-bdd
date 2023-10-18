Feature: scenario-simple

    Scenario: Scenario one
        Given Mounted input component
        When I type "ABC"
        Then input field has "ABC"
