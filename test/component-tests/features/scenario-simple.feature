Feature: component-tests

  Scenario: Mount input tag and interact with it
    Given Mounted input component
    When I type into field "textField" value "ABC"
    Then Field "textField" has value "ABC"

  Scenario: Mount custom component
    Given Mounted custom textarea
    When I type into field "custom-textarea" value "123"
    Then Field "custom-textarea" has value "123"

  Scenario: Using event handler in a component
    Given Mounted button with an event handler that record how many times it was pressed
    When I press the button
    Then the recorded number of times the button was pressed is 1
    When I press the button
    Then the recorded number of times the button was pressed is 2


# See: https://github.com/vitalets/playwright-bdd/issues/79
# Scenario: Mount component with png asset
#     Given Mounted Image component