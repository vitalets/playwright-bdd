@mode:serial
Feature: feature 1

  Scenario: failing scenario
    Given success step 1
    And failing step

  Scenario: success scenario (will be skipped)
    Given success step 1
    And success step 2
