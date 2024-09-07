@mode:serial
Feature: skip-by-serial-mode

  Scenario: failing scenario
    Given success step 1
    And failing step

  Scenario: success scenario (will be skipped)
    Given success step 1
    And success step 2
