Feature: Playwright homepage

  Background:
    Given I am on Playwright homepage

  Scenario: check get started link
    When I click link "Get started"
    Then I see header "About"
