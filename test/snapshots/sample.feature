Feature: snapshots

  Scenario: Check snapshot
    Then snapshot contains text "Example Domain"

  Scenario: Check screenshot
    Given I am on example.com
    Then screenshot matches previous one
