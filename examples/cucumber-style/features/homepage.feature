Feature: Home Page

  Scenario: Check title
    Given I am on home page
    Then I see in title "Playwright"

  Scenario: Check get started
    Given I am on home page
    When I click link "Get started"
    Then I see in title "Installation"

  Scenario: Check visually
    Given I am on home page
    Then I expect the page to be visually perfect

  Scenario: Check the header visually
    Given I am on home page
    Then I expect the "header" to be visually perfect

  Scenario: Check the header visually with layout match level
    Given I am on home page
    Then I expect the "header" to be visually perfect with "layout" match level
