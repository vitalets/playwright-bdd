Feature: Home Page

  Scenario: Check homepage header
    Given I am on home page
    # intentionally fails
    Then I see header "Cucumber"

  Scenario: Check get started
    Given I am on home page
    When I click link "Get started"
    # intentionally fails
    Then I see header "About"
