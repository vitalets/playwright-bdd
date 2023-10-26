Feature: component-tests

    Scenario: Mount component and interact with it
        Given Mounted input component
        When I type "ABC"
        Then input field has "ABC"

    Scenario: Using event handler in a component
        Given Mounted button with an event handler that record how many times it was pressed
        When I press the button
        Then the recorded number of times the button was pressed is 1
        When I press the button
        Then the recorded number of times the button was pressed is 2
