Feature: Authorized user

  Scenario: Homepage shows "Sign Out" for authorized user
    Given I am on homepage
    Then I see "Sign Out" in navigation panel
