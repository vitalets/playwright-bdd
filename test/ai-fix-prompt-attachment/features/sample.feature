Feature: Example homepage

  Background:
    Given I am on homepage

  @default-page
  Scenario: validate header
    Then I see header "xxx"

  @custom-page
  Scenario: Custom page
    Then failing test on custom page fixture
