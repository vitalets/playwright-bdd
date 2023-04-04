Feature123: Playwright site

    Scenario: Check home
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
