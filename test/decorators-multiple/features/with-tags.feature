Feature: Multiple decorators with tags

  @foo
  Scenario: Using step one with @foo tag
    Given step one
    Then log is "taggedStep"

  @bar
  Scenario: Using step two with @bar tag
    Given step two
    Then log is "taggedStep"
