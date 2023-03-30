Feature: Playwright site

    Background:
        Given I open url "https://playwright.dev"

    Scenario: Check home
        Then I see in title "Playwright"

    Scenario: Check get started
        When I click link "Get started"
        Then I see in title "Installation"