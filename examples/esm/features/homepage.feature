Feature: Home Page

  Scenario: Check title
    Given I am on home page
    Then I see in title "Playwright"

  Scenario: Check get started
    Given I am on home page
    When I click link "Get started"
    Then I see in title "Installation"
