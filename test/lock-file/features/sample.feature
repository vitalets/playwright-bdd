Feature: Lock file

  Scenario: Generate spec
    Given generate test-running.txt
    And wait for test-running.txt to be removed
