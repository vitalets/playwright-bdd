Feature: Playwright site

    Background:
        Given I open url 'https://playwright.dev'

    Scenario: Check home
        Then I see in title 'Playwright'

    Scenario: Check about
        When I click link 'About'
        Then I see in title 'About'