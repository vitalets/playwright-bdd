@timeout:1000
Feature: timeout-many-tags

  @timeout:5000
  Scenario: scenario with multiple @timeout tags
    Then delay 1050
