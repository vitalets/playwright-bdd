Feature: Authorized users

  Scenario: Homepage shows "Sign Out" for user 1
    Given I am logged in as "user1"
    When I am on homepage
    Then I see "Sign Out" in navigation panel

  Scenario: Homepage shows "Sign Out" for user 2
    Given I am logged in as "user2"
    When I am on homepage
    Then I see "Sign Out" in navigation panel
